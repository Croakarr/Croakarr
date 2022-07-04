import { Request } from "express";
import { Logger } from "./Logger";

import lidarr from "./applications/Lidarr/middleware";
import sonarr from "./applications/Sonarr/middleware";
import radarr from "./applications/Sonarr/middleware";
import jellyfin from "./applications/Jellyfin/middleware";
import plex from "./applications/Plex/middleware";
import ombi from "./applications/Ombi/middleware";

const middleware = [
    lidarr,
    sonarr,
    radarr,
    jellyfin,
    plex,
    ombi
]

export default function parseEvent(req: Request, logger: Logger): [string, any][] {
    let events: [string, any][] = [];


    for (let i = 0; i < middleware.length; i++) {
        let processed = middleware[i](req.headers, req.body, logger);

        if(processed) events.push(processed)
    }

    return events
}