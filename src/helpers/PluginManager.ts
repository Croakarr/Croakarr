import { EventEmitter } from "events";
import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";

import { CroakerrConfig } from "../interfaces/CroakerrConfig";
import logger, { Logger } from "../helpers/Logger";
import Plugin from "./Plugin";

export default class PluginManager extends EventEmitter {
    paths: string[];

    plugins: Map<string, Plugin> = new Map();

    constructor(config: CroakerrConfig) {
        super();

        // Load config defined plugin directories, or, if undefined or empty, load the default plugin directory
        this.paths = config.pluginDirectories ? config.pluginDirectories : [];
        if (this.paths.length === 0) this.paths.push("plugins");
    }


    loadAll(config: CroakerrConfig) {
        let targets: string[] = [];



        for (let i = 0; i < this.paths.length; i++) {
            let path = this.paths[i];
            logger.debug("Scanning directory for plugins - " + resolve(path));
            let folders = getDirectories(resolve(path));
            logger.debug(`Located ${folders.length} viable plugins`);
            targets = targets.concat(folders);
        }

        for (let i = 0; i < targets.length; i++) {
            let path = targets[i];
            let manifest = resolve(path, "croakerr-manifest.json");
            let rawManifest = readFileSync(manifest, 'utf-8');
            let parsed = null;
            try {
                parsed = JSON.parse(rawManifest);
            } catch (e) {
                logger.error("Failed to parse plugin manifest for plugin: " + path)
                console.log(e);
            }

            if (parsed !== null) {
                if (existsSync(resolve(path, parsed.entrypoint))) {
                    parsed.internalPath = path;
                    let plugin = new Plugin(resolve(path, parsed.entrypoint), parsed, config);
                    if (!this.plugins.has(plugin.manifest.name)) {
                        logger.debug("Plugin loaded: " + plugin.manifest.name);
                        this.plugins.set(plugin.manifest.name, plugin);
                    } else {
                        let conflict = this.plugins.get(plugin.manifest.name);
                        if (conflict !== undefined) {
                            logger.warn(`Plugin naming conflict: Plugin located at ${resolve(path)} conflicts with`)
                            logger.warn(`another plugin located at ${conflict.manifest.internalPath}`)
                        }
                    }
                } else {
                    logger.debug("Skipping plugin: " + parsed.name + " Reason: Missing Entrypoint");
                }
            }
        }

        let plugins = Array.from(this.plugins.keys());
        for (let i = 0; i < plugins.length; i++) {
            let name = plugins[i];
            let plugin = this.plugins.get(name);

            if (plugin) {
                if (plugin.entity.enable) {
                    try {
                        logger.debug("Attempting to initialize plugin: " + plugin.manifest.name);
                        plugin.entity.enable({ croakerr: plugin.iface, logger: new Logger(plugin.manifest.name) });
                    } catch (e) {
                        logger.error("Failed to initialize plugin: " + plugin.manifest.name);
                        logger.debug(e + "");
                    }
                } else {
                    logger.warn("Plugin does not include init method: " + plugin.manifest.name);
                    console.log(plugin.entity);
                }
            }
        }

        this.emit("loaded");
    }

    unloadAll() {
        let plugins = [...this.plugins];
        for (let i = 0; i < plugins.length; i++) {
            let [name, plugin] = plugins[i];
            logger.debug("Attempting to unload plugin: " + name);
            try {
                if (plugin.entity.disable) {
                    plugin.entity.disable();
                } else {
                    logger.debug("Plugin unloaded: " + name);
                }
            } catch (e) {
                logger.error("Unable to unload plugin gracefully: " + name);
                logger.debug(e + "");
            }
        }
    }

    emitEvent(event: string, data: any) {
        let plugins = [...this.plugins];
        for (let i = 0; i < plugins.length; i++) {
            let [name, plugin] = plugins[i];
            let handler = plugin.iface.events.get(event);
            if (handler) handler(data);
        }
    }
}



function getDirectories(source: string) {
    if (existsSync(source)) return readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => source + "/" + dirent.name)
        .filter(dirent => existsSync(resolve(dirent, "croakerr-manifest.json")));
    return []
}