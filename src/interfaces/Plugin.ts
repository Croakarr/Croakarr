import PluginInterface from "../helpers/PluginInterface";

export default interface Plugin {
    enable(caller: PluginInterface): Promise<boolean>;
    disable(): void;
}