import { CroakerrConfig, DEFAULT, validator } from "./interfaces/CroakerrConfig";

import { existsSync, readFileSync, writeFileSync } from "fs";

import { prompt } from "enquirer";

import logger from "./helpers/Logger";

export async function loadConfig(): Promise<CroakerrConfig> {
    if (existsSync("./config.json")) {
        let raw = readFileSync("./config.json", "utf-8");

        let config = JSON.parse(raw);


        if (validator(config)) return config;
        logger.error("Invalid configuration file...");
        let guide: any = await prompt({
            name: "guided",
            type: "confirm",
            message: "Would you like to use the guided setup?"
        });

        if (guide.guided) {
            logger.debug("Preparing guided configuration session.")
            logger.debug("please wait...")
            config = await guided();
            writeFileSync("./config.json", JSON.stringify(config));
        } else {
            let overwrite: any = await prompt({
                name: "granted",
                type: "confirm",
                message: "Would you like to overrite the corrupt config?"
            });
            if (overwrite.granted) {
                writeFileSync("./config.json", JSON.stringify(DEFAULT));
            } else {
                logger.warn("Configuration untouched, this message will show up every time that Croakerr launches")
                logger.warn("until the conguration meets the specification once again.")
                logger.warn("Falling back to DEFAULT_CONFIG")
            }
        }


        return DEFAULT;
    } else {
        let config = DEFAULT;
        logger.log("\x1b[34mThis appears to be the first time that Croakerr has run.\x1b[0m")
        logger.log("Initial launch may be longer than expected.");
        let guide: any = await prompt({
            name: "guided",
            type: "confirm",
            message: "Would you like to use the guided setup?"
        });

        if (guide.guided) {
            logger.debug("Preparing guided configuration session.")
            logger.debug("please wait...")
            config = await guided();
        }

        writeFileSync("./config.json", JSON.stringify(config));
        return config;
    }

    return DEFAULT;
}





const VALIDATE: RegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

async function guided(): Promise<CroakerrConfig> {
    let config = DEFAULT;

    try {
        let queries: any = await prompt([
            {
                name: "interface",
                type: "input",
                message: "What interface should Croakerr bind?",
                initial: config.interface,
                validate: (value: string): boolean => value.match(VALIDATE) !== null || value.toLowerCase() === "localhost"
            },
            {
                name: "port",
                type: "numeral",
                message: "What port should Croakerr bind?",
                initial: config.port,
                validate: (value: string): boolean => parseInt(value) > 0 && parseInt(value) < 65535
            }
        ])
        if (queries.interface) config.interface = queries.interface;
        if (queries.port) config.port = queries.port;
    } catch (e) {
        logger.error("Something went wrong during configuration guide.")
        logger.error("Falling back to default configuration.")
        console.log(e);
    }

    return config;
}