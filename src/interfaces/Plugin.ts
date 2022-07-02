import PluginInterface from "../helpers/PluginInterface";

export default interface Plugin {
    enable(caller: PluginInterface): void;
    disable(): void;
}