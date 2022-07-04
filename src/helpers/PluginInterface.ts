import axios from "axios";
import enquirer from "enquirer";

import { CroakerrConfig } from "../interfaces/CroakerrConfig";
import PluginManifest from "../interfaces/PluginManifest";
import { Logger } from "./Logger";


const FEATURES: [string, boolean][] = [
    ["settings", false],
    ["middleware", false]
]

export default class PluginInterface {
    events: Map<string, Function> = new Map();
    features: Map<string, boolean> = new Map();
    manifest: PluginManifest;
    config: CroakerrConfig;
    logger: Logger;

    constructor(manifest: PluginManifest, config: CroakerrConfig, logger: Logger) {
        this.manifest = manifest;
        this.config = config
        this.logger = logger;

        // Pre fill the feature map with false values (to disable any unwanted features).
        for (let i = 0; i < FEATURES.length; i++) {
            this.features.set(FEATURES[i][0], FEATURES[i][1])
        }
    }


    registerListener(event: string, callback: Function): boolean {
        try {
            this.logger.debug(`Registered listener for event '${event}'`)
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
            this.logger.error("Failed to send data")
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
            this.logger.error("Failed to fetch data")
            console.log(e)
            return null
        }
    }

    async prompt(question: any): Promise<any> {
        try {
            process.env.CRPROMPTING = "true";
            let x = await enquirer.prompt(question);
            process.stdin.setRawMode(true)
            process.stdin.setEncoding('utf8')
            process.env.CRPROMPTING = "false";
            process.stdin.resume()
            return x;
        } catch (e) {
            process.stdin.setRawMode(true)
            process.stdin.setEncoding('utf8')
            process.stdin.resume()
            process.env.CRPROMPTING = "false";
            return undefined;
        }
    }

    declareFeature(name: string): void {
        if (this.features.has(name)) {
            this.features.set(name, true);
        } else {
            this.logger.debug(`Unknown feature: "${name}"`);
        }
    }

    emitTest(event: string) {
        if (this.events.has(event)) {
            this.logger.debug(`Emitted test for event '${event}'`)
            this.events.get(event)?.call(null, null, true)
        } else {
            this.logger.debug(`Failed to emit test for event '${event}'`)

        }
    }
}