import { IncomingHttpHeaders } from "http";
import { Logger } from "../../Logger";

export default function Middleware(headers: IncomingHttpHeaders, _body: any, logger: Logger): [string, any] | undefined {
    console.log(headers["user-agent"]);
    if (headers["user-agent"]?.startsWith("Jellyfin-Server/")) {
        // let serverVersion = headers["user-agent"].split("/")[1];
        // console.log("Jellyfin Hook: Server version", serverVersion);
    }
    logger;

    return undefined;
}