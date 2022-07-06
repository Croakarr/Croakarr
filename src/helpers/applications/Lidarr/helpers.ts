import axios from "axios";

import { LidarrArtist, PartialArtist } from "./definitions";

const artists: any = {};
const albums: any = {};


export async function resolveArtist(artist: any, base: string, auth: string | null): Promise<LidarrArtist | PartialArtist> {
    if (auth !== null) {
        if (!artists[artist.id]) {
            let res: any = await axios.get(`${base}/api/v1/artist/${artist.id}`, {
                headers: {
                    "X-Api-Key": auth
                }
            }).catch(e => {
                console.log(e);
                return e
            });

            if (res) {
                if (res.status === 200 && res.data) {
                    try {
                        let parsed = new LidarrArtist(res.data);
                        artists[artist.id] = parsed;
                        return parsed;
                    } catch (e) {
                        console.log(e);
                    }
                }
            }

        } else return artists[artist.id]
    }

    return {
        id: artist.id,
        name: artist.name,
        musicBrainz: artist.mbId
    };
}


export async function resolveAlbum(album: any, base: string, auth: string | null): Promise<any> {
    if (!auth !== null) {
        if (!albums[album.id]) {
            let res: any = await axios.get(`${base}/api/v1/artist/${artist.id}`, {
                headers: {
                    "X-Api-Key": auth
                }
            }).catch(e => {
                console.log(e);
                return e
            });

            if (res) {
                if (res.status === 200 && res.data) {
                    try {

                        // let parsed = new LidarrArtist(res.data);
                        // artists[artist.id] = parsed;
                        // return parsed;
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        } else return albums[album.id];
    }


    return album;
}