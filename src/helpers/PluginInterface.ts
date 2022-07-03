import axios from "axios";

import logger from "../helpers/Logger";
import { CroakerrConfig } from "../interfaces/CroakerrConfig";
import PluginManifest from "../interfaces/PluginManifest";


export default class PluginInterface {
    events: Map<string, Function> = new Map();
    manifest: PluginManifest;
    config: CroakerrConfig;

    constructor(manifest: PluginManifest, config: CroakerrConfig) {
        this.manifest = manifest;
        this.config = config
    }


    registerListener(event: string, callback: Function): boolean {
        try {
            logger.debug(`Plugin: ${this.manifest.name}@${this.manifest.version} | Registered listener for event '${event}'`)
            this.events.set(event, callback);
            return true;
        } catch (e) {
            return false;
        }
    }

    async send(url: string, data: any) {
        try {
            await axios.post(url, data, {
                headers: {
                    'user-agent': "Croakerr/Version 0.0.1"
                }
            });
        } catch (e) {
            logger.error("Failed to send data")
            console.log(e)
        }
    }

    async fetch(url: string) {
        try {
            return axios.get(url, {
                headers: {
                    'user-agent': "Croakerr/Version 0.0.1"
                }
            })
        } catch (e) {
            logger.error("Failed to fetch data")
            console.log(e)
            return null
        }
    }

    emitTest(event: string) {
        if (this.events.has(event)) {
            logger.debug(`Plugin: ${this.manifest.name}@${this.manifest.version} | Emitted test for event '${event}'`)
            this.events.get(event)?.call(null, null, true)
        } else {
            logger.debug(`Plugin: ${this.manifest.name}@${this.manifest.version} | Failed to emit test for event '${event}'`)

        }
    }
}