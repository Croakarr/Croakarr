import PluginManager from "./helpers/PluginManager";
import * as system from "./system";

import logger from "./helpers/Logger";
import { CroakerrConfig } from "./interfaces/CroakerrConfig";
import express, { Request, Response } from "express";
import multer from "multer";
import parseEvent from "./helpers/eventParser";
import { Server } from "net";
import REPL from "./repl"

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

process.env.CROAKERR_VERSION = "0.0.1";

let server: Server | null = null;
let config: CroakerrConfig | null;
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

    pluginManager.loadAll(config);


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
    try {
        let [event, data] = parseEvent(req, logger);

        if (event.length > 0 && pluginManager !== null) {
            pluginManager.emitEvent(event, data);
        }

        res.sendStatus(200);
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