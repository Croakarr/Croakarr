import { CroakerrConfig, DEFAULT, validator } from "./interfaces/CroakerrConfig";

import { existsSync, readFileSync, writeFileSync } from "fs";

import prompt, { prompts } from "prompts";

import logger from "./helpers/Logger";

export async function loadConfig(): Promise<CroakerrConfig> {
    if (existsSync("./config.json")) {
        let raw = readFileSync("./config.json", "utf-8");

        let config = JSON.parse(raw);


        if (validator(config)) return config;
        logger.error("Invalid configuration file...");
        let guide: any = await prompt({
            name: "guided",
            message: "Would you like to use the guided setup?",
            type: "toggle",
            initial: false,
            active: "Yes",
            inactive: "No"
        });


        if (guide) {
            logger.debug("Preparing guided configuration session.")
            logger.debug("please wait...")
            config = await guided();
            writeFileSync("./config.json", JSON.stringify(config));
        } else {
            let overwrite: any = await prompts.toggle({
                name: "overwrite",
                message: "Would you like to overrite the corrupt config?",
                type: "toggle",
                initial: false,
                active: "Yes",
                inactive: "No"
            });
            if (overwrite) {
                writeFileSync("./config.json", JSON.stringify(DEFAULT));
            } else {
                logger.warn("Configuration untouched, this message will show up every time that Croakerr launches")
                logger.warn("until the conguration meets the specification once again.")
                logger.warn("Falling back to DEFAULT_CONFIG")
            }
        }

        process.stdin.setRawMode(true)
        process.stdin.setEncoding('utf8')
        process.env.CRPROMPTING = "false";
        process.stdin.resume()
        return DEFAULT;
    } else {
        let config = DEFAULT;
        logger.log("\x1b[34mThis appears to be the first time that Croakerr has run.\x1b[0m")
        logger.log("Initial launch may be longer than expected.");
        let guide: any = await prompts.toggle({
            name: "guided",
            message: "Would you like to use the guided setup?",
            type: "toggle",
            initial: false,
            active: "Yes",
            inactive: "No"
        });

        console.log(guide);

        if (guide) {
            logger.debug("Preparing guided configuration session.")
            logger.debug("please wait...")
            config = await guided();
        }

        writeFileSync("./config.json", JSON.stringify(config));

        process.stdin.setRawMode(true)
        process.stdin.setEncoding('utf8')
        process.env.CRPROMPTING = "false";
        process.stdin.resume()
        return config;
    }
}





const VALIDATE: RegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

async function guided(): Promise<CroakerrConfig> {
    let config = DEFAULT;

    try {
        let queries: any = {
            interface: await prompts.text({
                name: "interface",
                type: "text",
                message: "What interface should Croakerr bind?",
                initial: config.interface,
                validate: (value: string) => (value.match(VALIDATE) !== null || value.toLowerCase() === "localhost") ? true : "Value must be a valid IP address or 'localhost'"
            }),
            port: await prompts.number({
                name: "port",
                type: "number",
                message: "What port should Croakerr bind?",
                initial: config.port,
                validate: (value: string) => (parseInt(value) > 0 && parseInt(value) < 65535) ? true : 'Port number must be more than 0 and less than 65535'
            })
        }

        console.log(queries)

        if (queries.interface) config.interface = queries.interface;
        if (queries.port) config.port = queries.port;
    } catch (e) {
        logger.error("Something went wrong during configuration guide.")
        logger.error("Falling back to default configuration.")
        console.log(e);
    }

    return config;
}