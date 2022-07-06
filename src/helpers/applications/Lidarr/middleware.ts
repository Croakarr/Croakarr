
import { IncomingHttpHeaders } from "http";
import { CroakarrConfig } from "../../../interfaces/CroakarrConfig";
import { Logger } from "../../Logger";
import { resolveArtist, resolveAlbum } from "./helpers";


// const qualityProfiles: Map<number, LidarrQualityProfile> = new Map();


// Health
// - types:
//      - IndexerStatusCheck
// - loglevels:
//      - warning
//      - 
// Test
// Download
// Grab
// {
//   artist: {
//     id: 448,
//     name: 'David Guetta',
//     path: 'D:\\Media\\Lidarr\\David Guetta',
//     mbId: '302bd7b9-d012-4360-897a-93b00c855680'
//   },
//   albums: [
//     {
//       id: 15006,
//       title: 'One Love',
//       releaseDate: '2009-08-21T00:00:00Z',
//       quality: 'FLAC',
//       qualityVersion: 1
//     }
//   ],
//   release: {
//     quality: 'FLAC',
//     qualityVersion: 1,
//     releaseTitle: 'David Guetta - One Love [FLAC][Simbalord Lone Release]',
//     indexer: 'kickasstorrents.ws (Prowlarr)',
//     size: 1610612736
//   },
//   downloadClient: 'qBittorrent',
//   downloadId: '341150FF659606F1E7868DB2310FB2C58459FC92',
//   eventType: 'Grab'
// }

// Retag
// {
//   artist: {
//     id: 415,
//     name: 'Caravan Palace',
//     path: 'D:\\Media\\Lidarr\\Caravan Palace',
//     mbId: '72eabb1a-4d2c-4de6-90f2-671b2cada42b'
//   },
//   eventType: 'Retag'
// }


export default async function Middleware(headers: IncomingHttpHeaders, body: any, logger: Logger, config: CroakarrConfig): Promise<[string, any] | undefined> {

    if (headers["user-agent"]?.startsWith("Lidarr/")) {
        // Generate base URL for resolving API queries from service configuration;
        let base = "http" + (config.services.lidarr.useSSL ? "s" : "") + "://" + config.services.lidarr.host + ":" + config.services.lidarr.port

        let ua = headers["user-agent"];
        let serverVersion = ua.split("/")[1].split(" (")[0];
        let platform = ua.split("(")[1].split(" ")[0];
        let osVersion = ua.split(" ").pop()?.split(")")[0];

        console.log(body)


        switch (body.eventType) {
            // Event "Retag" - when tags are modified or updated for an artist
            // Processed instance is an instance of LidarrArtist.
            case "Retag":
                return [
                    "lidarr.retag",
                    {
                        processed: {
                            artist: await resolveArtist(body.artist.id, base, config.services.lidarr.token)
                        },
                        raw: body
                    }
                ];

            // Event "Grab" - When content is grabbed by an indexer and queued for download by Lidarr
            case "Grab":
                let payload = {
                    processed: {},
                    raw: body
                }

                if (config.services.lidarr.enabled) {
                    payload.processed = {
                        artist: await resolveArtist(body.artist, base, config.services.lidarr.token),
                        albums: new Array<any>(),
                        release: body.release,
                        download: {
                            client: body.downloadClient,
                            id: body.downloadId
                        },
                        source: {
                            name: "Lidarr",
                            platform: {
                                name: platform,
                                version: osVersion
                            },
                            version: serverVersion
                        }
                    }
                }

                for (let i = 0; i < body.albums.length; i++) {
                    payload.processed.albums.push(await resolveAlbum(body.albums[i], base, config.services.lidarr.token));
                };

                console.log(payload);


                return ["lidarr.grab", payload];

            default:
                console.log("Unknown event:", body.eventType);
        }
    }
    logger;

    return undefined;
}

