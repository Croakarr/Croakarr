import { IncomingHttpHeaders } from "http";
import { Logger } from "../../Logger";

export default function Middleware(headers: IncomingHttpHeaders, _body: any, logger: Logger): [string, any] | undefined {
    console.log(headers["user-agent"]);
    // if (headers["user-agent"]?.startsWith("Jellyfin/")) {
    //     console.log("Jellyfin User Agent: ", headers["user-agent"]);
    // }
    logger;

    return undefined;
}