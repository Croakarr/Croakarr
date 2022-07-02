import { Request } from "express";
import { Logger } from "./Logger";

export default function parseEvent(req: Request, logger: Logger): [string, any] {
    let ua = req.headers['user-agent'];
    let event = "";
    let data = null;
    if (ua !== undefined) {
        ua = ua.split("/").shift();
        switch (ua) {
            case "Sonarr":
                event = "sonarr.";
                data = req.body;
                event += data.eventType.toLowerCase();
                break;
            case "Radarr":
                event = "radarr.";
                data = req.body;
                event += data.eventType.toLowerCase();
                break;
            case "Lidarr":
                event = "lidarr.";
                data = req.body;
                event += data.eventType.toLowerCase();
                break;
            case "PlexMediaServer":
                event = "plex.";
                data = JSON.parse(req.body.payload);
                event += data.event;
                break;
            default:
                logger.debug("Unknown useragent: " + ua);
        }
    } else {
        console.log(req.headers);
        console.log(req.body);
    }

    return [event, data]
}