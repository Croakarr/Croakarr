import { CroakarrConfig, DEFAULT, Service, validator } from "./interfaces/CroakerrConfig";

import { existsSync, readFileSync, writeFileSync } from "fs";

import prompt, { prompts } from "prompts";

import logger from "./helpers/Logger";

export async function loadConfig(): Promise<CroakarrConfig> {
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

async function guided(): Promise<CroakarrConfig> {
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
            }),
            services: {
                sonarr: await serviceSetup(" Sonarr", 8989),
                lidarr: await serviceSetup(" Lidarr", 8686),
                radarr: await serviceSetup(" Radarr", 7878),
                plex: await serviceSetup(" Plex", 32400),
                ombi: await serviceSetup("n Ombi", 5000),
                jellyfin: await serviceSetup(" Jellyfin", 8096)
            }
        }
        if (queries.interface) config.interface = queries.interface;
        if (queries.port) config.port = queries.port;
        if (queries.services) config.services = queries.services;
    } catch (e) {
        logger.error("Something went wrong during configuration guide.")
        logger.error("Falling back to default configuration.")
        console.log(e);
    }

    return config;
}


async function serviceSetup(name: string, defaultPort: number): Promise<Service> {
    try {
        console.log();
        let setup: any = await prompts.toggle({
            name: "setup",
            message: "Would you like to configure a" + name + " instance?",
            type: "toggle",
            initial: false,
            active: "Yes",
            inactive: "No"
        });
        if (setup) {
            let service: any = {
                enabled: true,
                host: await prompts.text({
                    name: "host",
                    type: "text",
                    message: "What host is " + name + " accessible from?",
                    initial: "127.0.0.1",
                    validate: (value: string) => (value.match(VALIDATE) !== null || value.toLowerCase() === "localhost") ? true : "Value must be a valid IP address or 'localhost'"
                }),
                port: await prompts.number({
                    name: "port",
                    type: "number",
                    message: "What port is " + name + " accessible from?",
                    initial: defaultPort,
                    validate: (value: string) => (parseInt(value) > 0 && parseInt(value) < 65535) ? true : 'Port number must be more than 0 and less than 65535'
                }),
                useSSL: await prompts.toggle({
                    name: "setup",
                    message: "Which protocol should we use when querying this service?",
                    type: "toggle",
                    initial: false,
                    active: "https",
                    inactive: "http"
                }),
                token: await prompts.text({
                    name: "host",
                    type: "text",
                    message: "Enter your " + name + " API key",
                })
            }

            return service;
        } else {
            return {
                enabled: false,
                host: null,
                port: null,
                useSSL: false,
                token: null
            }
        }
    } catch (e) {
        logger.error("Error whilst configuring service: " + name);
        console.log(e);
        return {
            enabled: false,
            host: null,
            port: null,
            useSSL: false,
            token: null
        }
    }
}