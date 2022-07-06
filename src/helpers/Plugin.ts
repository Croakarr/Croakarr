import PluginManifest from "../interfaces/PluginManifest";
import PluginInterface from "./PluginInterface";
import logger, { Logger } from "../helpers/Logger";
import { CroakarrConfig } from "../interfaces/CroakarrConfig";

export default class Plugin {
    metadata: PluginMetadata;
    manifest: PluginManifest;
    iface: PluginInterface;
    entity: any;
    status: pluginStatus;

    constructor(entrypoint: string, manifest: PluginManifest, config: CroakarrConfig) {
        this.manifest = manifest;
        this.iface = new PluginInterface(manifest, config, new Logger(manifest.name));
        this.entity = require(entrypoint);
        this.status = {
            active: false,
            error: ""
        }
        this.metadata = {
            loaded: new Date(),
            statistics: new Map()
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
    active: boolean;
    error: any;
}

interface PluginMetadata {
    loaded: Date;
    statistics: Map<string, number>;
}