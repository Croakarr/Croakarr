import PluginManager from "./helpers/PluginManager";
import * as system from "./system";

import logger from "./helpers/Logger";
import { CroakarrConfig } from "./interfaces/CroakarrConfig";
import express, { Request, Response } from "express";
import multer from "multer";
import parseEvent from "./helpers/eventParser";
import { Server } from "net";
import REPL from "./repl"
import axios from "axios";

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

process.env.CROAKARR_VERSION = "0.0.1";

let server: Server | null = null;
let config: CroakarrConfig | null;
let pluginManager: PluginManager | null;

logger.log("Welcome to Croakarr.")
logger.log("Please wait whilst we get things started.")
logger.log("=========================================")
logger.log(" Croakarr Is Initializing - Test Message");
logger.info(" Croakarr Is Initializing - Test Message");
logger.debug(" Croakarr Is Initializing - Test Message");
logger.warn(" Croakarr Is Initializing - Test Message");
logger.error(" Croakarr Is Initializing - Test Message");
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

    if (config !== null) {

        parseEvent(req, logger, config).then(events => {
            for (let i = 0; i < events.length; i++) {
                let [event, data] = events[i];
                console.log("Emitting event: ", event);
                if (event.length > 0 && pluginManager !== null) {
                    pluginManager.emitEvent(event, data);
                }
            }
        }).catch(e => {
            logger.error("Unexpected error handling webhook");
            logger.debug(e + "");
        })


    }
}

function shutdown() {

    pluginManager?.unloadAll();
    logger.log("Thank you for using Croakarr.")
    logger.log("Consider giving the project a start on GitHub.")
    logger.log("https://github.com/CroakarrApp/Croakarr");
}

process.on("SIGTERM", shutdown);
process.on("SIGKILL", shutdown);
process.on("beforeExit", shutdown);




async function checkServices() {
    if (config !== null) {
        if (config.services.lidarr.enabled) {
            logger.debug("Lidarr - Status: \x1b[33mChecking...\x1b[0m")
            process.stdout.write("\x1b[A\r");
            let url = "http";

            if (config.services.lidarr.useSSL) url += "s";
            if (!config.services.lidarr.token) {
                logger.debug("\x1b[43m\x1b[30mLidarr\x1b[0m - Status: \x1b[43m\x1b[30mNo Key\x1b[0m\x1b[0K")
                logger.warn("Service \x1b[32m'Lidarr'\x1b[0m has no API key, however one is required.")
                logger.warn("Service will be unavailable until remedied and restarted.")
                config.services.lidarr.enabled = false;
            } else {
                let req = await axios.get(url + "://" + config.services.lidarr.host + ":" + config.services.lidarr.port + "/api/v1/system/status", {
                    headers: {
                        "user-agent": "Croakarr",
                        "content-type": "application/json",
                        "X-Api-Key": config.services.lidarr.token
                    }
                }).catch(_ => { });

                if (req) {
                    if (req.data.appName) {
                        if (req.data.appName === "Lidarr") {
                            logger.debug("Lidarr - Status: \x1b[32mActive\x1b[0m\x1b[0K")
                            config.services.lidarr.enabled = true;
                        } else {
                            config.services.lidarr.enabled = false;
                        }
                    } else config.services.lidarr.enabled = false;
                } else config.services.lidarr.enabled = false;
            }

            if (!config.services.lidarr.enabled && config.services.lidarr.token !== null) {
                logger.debug("Lidarr - Status: \x1b[31mInactive\x1b[0m\x1b[0K")
                logger.warn("Failed to validate service: Lidarr, service unavailable until fixed.")
            }
        } else logger.debug("Radarr - Status: \x1b[2mDisabled\x1b[0m")



        if (config.services.sonarr.enabled) {
            logger.debug("Sonarr - Status: \x1b[33mChecking...\x1b[0m")
            process.stdout.write("\x1b[A\r");
            let url = "http";

            if (config.services.sonarr.useSSL) url += "s";
            if (!config.services.sonarr.token) {
                logger.debug("\x1b[43m\x1b[30mSonarr\x1b[0m - Status: \x1b[43m\x1b[30mNo Key\x1b[0m\x1b[0K")
                logger.warn("Service \x1b[32m'Sonarr'\x1b[0m has no API key, however one is required.")
                logger.warn("Service will be unavailable until remedied and restarted.")
                config.services.lidarr.enabled = false;
            } else {
                let req = await axios.get(url + "://" + config.services.sonarr.host + ":" + config.services.sonarr.port + "/api/v3/system/status", {
                    headers: {
                        "user-agent": "Croakarr",
                        "content-type": "application/json",
                        "X-Api-Key": config.services.sonarr.token
                    }
                }).catch(_ => { });

                if (req) {
                    if (req.data.appName) {
                        if (req.data.appName === "Sonarr") {
                            logger.debug("Sonarr - Status: \x1b[32mActive\x1b[0m\x1b[0K")
                            config.services.sonarr.enabled = true;
                        } else {
                            config.services.sonarr.enabled = false;
                        }
                    } else config.services.sonarr.enabled = false;
                } else config.services.sonarr.enabled = false;
            }

            if (!config.services.sonarr.enabled && config.services.sonarr.token !== null) {
                logger.debug("Sonarr - Status: \x1b[31mInactive\x1b[0m\x1b[0K")
                logger.warn("Failed to validate service: Sonarr, service unavailable until fixed.")
            }
        } else logger.debug("Radarr - Status: \x1b[2mDisabled\x1b[0m")

        if (config.services.radarr.enabled) {
            logger.debug("Radarr - Status: \x1b[33mChecking...\x1b[0m")
            process.stdout.write("\x1b[A\r");
            let url = "http";

            if (config.services.radarr.useSSL) url += "s";
            if (!config.services.radarr.token) {
                logger.debug("\x1b[43m\x1b[30mRadarr\x1b[0m - Status: \x1b[43m\x1b[30mNo Key\x1b[0m\x1b[0K")
                logger.warn("Service \x1b[32m'Radarr'\x1b[0m has no API key, however one is required.")
                logger.warn("Service will be unavailable until remedied and restarted.")
                config.services.radarr.enabled = false;
            } else {
                let req = await axios.get(url + "://" + config.services.radarr.host + ":" + config.services.radarr.port + "/api/v3/system/status", {
                    headers: {
                        "user-agent": "Croakarr",
                        "content-type": "application/json",
                        "X-Api-Key": config.services.radarr.token
                    }
                }).catch(_ => { });

                if (req) {
                    if (req.data.appName) {
                        if (req.data.appName === "Radarr") {
                            logger.debug("Radarr - Status: \x1b[32mActive\x1b[0m\x1b[0K")
                            config.services.radarr.enabled = true;
                        } else {
                            config.services.radarr.enabled = false;
                        }
                    } else config.services.radarr.enabled = false;
                } else config.services.radarr.enabled = false;
            }

            if (!config.services.radarr.enabled && config.services.radarr.token !== null) {
                logger.debug("Radarr - Status: \x1b[31mInactive\x1b[0m")
                logger.warn("Failed to validate service: Radarr, service unavailable until fixed.")
            }
        } else logger.debug("Radarr - Status: \x1b[2mDisabled\x1b[0m")

        if (config.services.plex.enabled) {
            logger.warn("Health checks are unavailable for service: Plex")
        } else logger.debug("Plex - Status: \x1b[2mDisabled\x1b[0m")

        if (config.services.ombi.enabled) {
            logger.warn("Health checks are unavailable for service: Ombi")
        } else logger.debug("Ombi - Status: \x1b[2mDisabled\x1b[0m")

        if (config.services.jellyfin.enabled) {
            logger.warn("Health checks are unavailable for service: Jellyfin")
        } else logger.debug("Jellyfin - Status: \x1b[2mDisabled\x1b[0m")
    }
}



