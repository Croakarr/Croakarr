import PluginManager from "./helpers/PluginManager";
import * as system from "./system";

import logger from "./helpers/Logger";
import { CroakarrConfig } from "./interfaces/CroakerrConfig";
import express, { Request, Response } from "express";
import multer from "multer";
import parseEvent from "./helpers/eventParser";
import { Server } from "net";
import REPL from "./repl"
import axios from "axios";

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

process.env.CROAKERR_VERSION = "0.0.1";

let server: Server | null = null;
let config: CroakarrConfig | null;
let pluginManager: PluginManager | null;

logger.log("Welcome to Croakerr.")
logger.log("Please wait whilst we get things started.")
logger.log("=========================================")
logger.log(" Croakerr Is Initializing - Test Message");
logger.info(" Croakerr Is Initializing - Test Message");
logger.debug(" Croakerr Is Initializing - Test Message");
logger.warn(" Croakerr Is Initializing - Test Message");
logger.error(" Croakerr Is Initializing - Test Message");
logger.log("=========================================")

runtime()

async function runtime() {
    config = await system.loadConfig();

    await checkServices();



    pluginManager = new PluginManager(config);

    pluginManager.once("loaded", async () => {
        await spawnInterface();
        if (server !== null) {
            if (config !== null) {
                if (pluginManager !== null) {
                    new REPL(logger, server, config, pluginManager, app);
                } else {
                    logger.error("plugin manager is null, pre-emptively closing to prevent further errors.");
                    process.exit();
                }
            } else {
                logger.error("config is null, pre-emptively closing to prevent further errors.");
                process.exit();
            }
        } else {
            logger.error("Server is null, pre-emptively closing to prevent further errors.");
            process.exit();
        }
    });

    await pluginManager.loadAll(config);


}


async function spawnInterface() {
    return new Promise((resolve) => {
        if (config !== null) {
            app.use(require("body-parser").json())
            app.all('*', upload.any(), router);
            server = app.listen(config.port, config.interface, () => {
                if (config !== null) logger.log(`Listening on http://${config.interface}:${config.port}`);
                resolve(null);
            })
        } else {
            logger.error("Config is null upon spawning hook interface.")
            resolve(null);
        }
    })
}


async function router(req: Request, res: Response) {
    res.sendStatus(200);
    try {
        let events = parseEvent(req, logger);

        for (let i = 0; i < events.length; i++) {
            let [event, data] = events[i];
            console.log("Emitting event: ", event);
            if (event.length > 0 && pluginManager !== null) {
                pluginManager.emitEvent(event, data);
            }
        }
    } catch (e) {
        logger.error("Unexpected error handling webhook");
        logger.debug(e + "");
    }
}

function shutdown() {

    pluginManager?.unloadAll();
    logger.log("Thank you for using Croakerr.")
    logger.log("Consider giving the project a start on GitHub.")
    logger.log("https://github.com/AltriusRS/Croakerr");
}

process.on("SIGTERM", shutdown);
process.on("SIGKILL", shutdown);
process.on("beforeExit", shutdown);




async function checkServices() {
    if (config !== null) {
        if (config.services.sonarr.enabled) {
            let url = "http";

            if (config.services.sonarr.useSSL) url += "s";
            if (!config.services.sonarr.token) {
                logger.error("Service \x1b[32m'Sonarr'\x1b[0m has no API key, however one is required.")
                logger.error("Service will be unavailable until remedied and restarted.")
                config.services.sonarr.enabled = false;
            } else {
                let req = await axios.get(url + "://" + config.services.sonarr.host + ":" + config.services.sonarr.port + "/system/status", {
                    headers: {
                        "user-agent": "Croakarr",
                        "content-type": "application/json",
                        "X-Api-Key": config.services.sonarr.token
                    }
                }).catch(reason => {
                    logger.warn("Requested errored with reason:")
                    logger.debug(reason)
                });

                if (req) console.log(req.data);
            }
        }

        if (config.services.lidarr.enabled) {

        }

        if (config.services.radarr.enabled) {

        }

        if (config.services.plex.enabled) {

        }

        if (config.services.ombi.enabled) {

        }

        if (config.services.jellyfin.enabled) {

        }
    }
}



