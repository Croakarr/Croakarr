import axios from "axios";
import { IncomingHttpHeaders } from "http";
import { CroakarrConfig } from "../../../interfaces/CroakarrConfig";
import { Logger } from "../../Logger";
import { LidarrArtist } from "./definitions";


// const qualityProfiles: Map<number, LidarrQualityProfile> = new Map();


export default async function Middleware(headers: IncomingHttpHeaders, body: any, logger: Logger, config: CroakarrConfig): Promise<[string, any] | undefined> {

    if (headers["user-agent"]?.startsWith("Lidarr/")) {
        // Generate base URL for resolving API queries from service configuration;
        let base = "http" + (config.services.lidarr.useSSL ? "s" : "") + "://" + config.services.lidarr.host + ":" + config.services.lidarr.port

        if (config.services.lidarr.token !== null) {
            let artist = await resolveArtist(389, base, config.services.lidarr.token);
            console.log(artist);
        }


        // let ua = headers["user-agent"];
        //     let serverVersion = ua.split("/")[1].split(" (")[0];
        //     let platform = ua.split("(")[1].split(" ")[0];
        //     let osVersion = ua.split(" ").pop()?.split(")")[0];
        //     console.log(`Lidarr:
        // Release: ${serverVersion}
        // OS: ${platform}
        // OS Version: ${osVersion}`);
        console.log(body)
        console.log(config.services.lidarr)
    }
    logger;

    return undefined;
}

async function resolveArtist(id: number, base: String, auth: string): Promise<LidarrArtist | null> {
    let res: any = await axios.get(`${base}/api/v1/artist/${id}`, {
        headers: {
            "X-Api-Key": auth
        }
    }).catch(e => {
        console.log(e);
        return e
    });

    if (res) {
        if (res.status === 200) {
            try {
                if (res.data) {
                    return new LidarrArtist(res.data);
                } else {
                    console.log(res);
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
    return null;
}