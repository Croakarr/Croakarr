import { Logger } from "../helpers/Logger";
import PluginInterface from "../helpers/PluginInterface";

export default interface Plugin {
    enable(caller: { croakarr: PluginInterface, logger: Logger }): Promise<[boolean, Error | null]>;
    disable(): void;
}