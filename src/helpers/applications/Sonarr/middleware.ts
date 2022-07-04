import { IncomingHttpHeaders } from "http";
import { Logger } from "../../Logger";

export default function Middleware(headers: IncomingHttpHeaders, body: any, logger: Logger): [string, any] | undefined {
    console.log(headers, body);
    logger;

    return undefined;
}