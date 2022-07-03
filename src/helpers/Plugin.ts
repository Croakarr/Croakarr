import PluginManifest from "../interfaces/PluginManifest";
import PluginInterface from "./PluginInterface";
import logger from "../helpers/Logger";
import { CroakerrConfig } from "../interfaces/CroakerrConfig";

export default class Plugin {
    manifest: PluginManifest;
    iface: PluginInterface;
    entity: any;
    status: pluginStatus;

    constructor(entrypoint: string, manifest: PluginManifest, config: CroakerrConfig) {
        this.manifest = manifest;
        this.iface = new PluginInterface(manifest, config);
        this.entity = require(entrypoint);
        this.status = {
            active: false,
            error: ""
        }
    }

    init() {
        try {
            logger.debug("Initializing plugin: " + this.manifest.name)
            this.entity.init()
        } catch (e) {
            logger.error("Error whilst initializing plugin: " + this.manifest.name)
            logger.debug(e + "");
        }
    }
}


interface pluginStatus {
    active: boolean,
    error: any
}