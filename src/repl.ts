import { Server } from "net";
import { EventEmitter } from "stream";
import readline from "readline";

import PluginManager from "./helpers/PluginManager";
import { CroakarrConfig } from "./interfaces/CroakarrConfig";
import { Logger } from "./helpers/Logger";
import { resolve } from "path";
import { Application } from "express";

readline.emitKeypressEvents(process.stdin);

export default class REPL extends EventEmitter {
    server: Server;
    config: CroakarrConfig;
    pm: PluginManager;
    history: string[] = [];
    historyPosition: number = 0;
    logger: Logger;
    app: Application;
    command: string = "";
    constructor(logger: Logger, server: Server, config: CroakarrConfig, pm: PluginManager, app: Application) {
        super();
        this.app = app;
        this.server = server;
        this.config = config;
        this.pm = pm;
        this.logger = logger;
        // let interval: null | NodeJS.Timer = null;
        // let showColon: boolean = false;
        process.stdin.on('keypress', async (str, key) => {
            if (process.env.CRPROMPTING !== "true") {
                if (key.ctrl && key.name === 'c') {
                    process.exit();
                } else {
                    switch (key.name) {
                        case "return":
                            process.stdout.write("\n");
                            await this.eval();
                            break;
                        case "backspace":
                            this.command = this.command.substring(0, this.command.length - 1);
                            process.stdout.write("\r🐸 \x1b[32m>\x1b[0m " + this.command + "\x1b[K");
                            break;
                        case "up":
                            if (this.historyPosition - 1 < 0) {
                                this.historyPosition -= 1;
                                if (this.history[this.historyPosition] !== undefined) {
                                    this.command = this.history[this.historyPosition]
                                } else {
                                    this.command = "";
                                }
                            } else {
                                if (this.history.length === 0) {
                                    this.command = "";
                                } else this.command = this.history[this.historyPosition]
                            }
                            break;
                        case "down":
                            if (this.history.length > 0) {
                                if (this.historyPosition + 1 < 0) {
                                    if (this.history[this.historyPosition] !== undefined) {
                                        this.command = this.history[this.historyPosition]
                                    } else {
                                        this.command = "";
                                    }
                                }
                            }
                            break;
                        default:
                            this.command += str
                    };

                    process.stdout.write("\r🐸 \x1b[32m>\x1b[0m " + this.command);
                }
            }
        });
        logger.log("Welcome to the Croakarr REPL.")
        logger.log("Use \x1b[32mhelp\x1b[0m for more info.\x1b[0m")
        process.stdout.write(`\r🐸 \x1b[32m>\x1b[0m `);

    }


    async eval() {
        process.stdin.setRawMode(false);
        process.stdin.setRawMode(true);
        this.history.push(this.command);
        let cmd = this.command;
        this.command = "";
        let args = cmd.split(" ");
        switch (args[0]) {
            case "exit":
                process.exit();
            case "version":
                console.log("Croakarr Version " + process.env.CROAKARR_VERSION);
                console.log();
                break;
            case "help":
                console.log("Available commands");
                console.log();
                console.log("exit            - Quits Croakarr");
                console.log();
                console.log("help            - Shows this message");
                console.log();
                console.log("version         - Displays the version");
                console.log();
                console.log("config          - Displays the current config");
                console.log();
                console.log("plugin          - Command group for anything related to plugins");
                console.log(" - list         - List all available plugins ");
                console.log("     - active   - list only active plugins");
                console.log("     - inactive - list only inactive plugins");
                console.log("     - error    - list only plugins which have had an error");
                console.log();
                break;
            case "plugin":
                args.shift();
                await this.plugins(args);
                break;

            case "reload":
                this.logger.warn("RELOAD REQUESTED, UNLOADING PLUGINS");
                this.pm.unloadAll();
                this.server.close();
                console.clear();
                this.pm.loadAll(this.config);
                this.logger.log(`Listening on http://${this.config.interface}:${this.config.port}`);
                this.server = this.app.listen(this.config.port, this.config.interface)
                break;

            case "config":
                console.log(" Network Interface: " + this.config.interface);
                console.log("              Port: " + this.config.port);
                console.log("Plugin Directories:")
                for (let i = 0; i < this.config.pluginDirectories.length; i++) {
                    console.log(" - " + resolve(this.config.pluginDirectories[i]));
                }
                console.log();
                break;
            default:
                console.log("UNKNOWN COMMAND:", args[0]);
        }
    }


    async plugins(args: string[]) {
        switch (args[0]) {
            case "info":
                if (args[1]) {
                    let plugin = this.pm.plugins.get(args[1])
                    if (plugin) {
                        console.log(`Name:        ${plugin.manifest.name}`);
                        console.log(`Version:     ${plugin.manifest.version}`);
                        console.log(`Description: ${plugin.manifest.description ? plugin.manifest.description : "Not Specified"}`);
                        console.log(`Author:      ${plugin.manifest.author}`);
                        console.log(`Homepage:    ${plugin.manifest.homepage ? plugin.manifest.homepage : "Not Specified"}`);
                        console.log(`Loaded:      ${plugin.metadata.loaded.toLocaleString()}`)
                        console.log(`Hook Audit:`)
                        let hooks = Array.from(plugin.iface.events.keys());
                        for (let i = 0; i < hooks.length; i++) {
                            let hook = hooks[i];

                            console.log("  - ", hook);
                        }
                        console.log(`Hook Usage:`)
                        let hooksUsed = Array.from(plugin.metadata.statistics.entries());
                        for (let i = 0; i < hooksUsed.length; i++) {
                            let [hook, calls] = hooksUsed[i];

                            console.log("  - ", calls.toLocaleString(), hook);
                        }

                    } else {
                        console.log("Error: Unable to locate plugin by that name.")
                    }
                } else {
                    console.log("Error: Missing argument <name>")
                }
                break;
            case "list":
                if (args[1]) {
                    console.log("filters not implemented");
                    if (this.pm.plugins.size === 0) {
                        console.log("\x1b[33mNo plugins loaded.\x1b[0m")
                    } else {
                        let plugins = Array.from(this.pm.plugins.entries());
                        for (let i = 0; i < plugins.length; i++) {
                            let [name, plugin] = plugins[i]
                            if (plugin) {
                                if (plugin.status.active) {
                                    if (plugin.status.error === "Naming Collision") {
                                        console.log(`\x1b[33m${name}\x1b[0m (${plugin.manifest.name}) - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                    } else {
                                        console.log(`\x1b[32m${name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                    }
                                } else {
                                    if (plugin.status.error === "Plugin Unloaded") {
                                        console.log(`\x1b[2m${name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                    } else if (plugin.status.error === "Plugin Unloaded") {
                                        console.log(`\x1b[33m${name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                    } else {
                                        console.log(`\x1b[31m${name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                        console.log(` - Error: ${plugin.status.error}`)
                                    }
                                }
                            }
                        }
                    }
                    console.log("\nGet detailed info on a specific plugin by using \x1b[2m\x1b[32mplugin info <plugin name>\x1b[0m")
                } else {
                    if (this.pm.plugins.size === 0) {
                        console.log("\x1b[33mNo plugins loaded.\x1b[0m")
                    } else {
                        let plugins = Array.from(this.pm.plugins.entries());
                        for (let i = 0; i < plugins.length; i++) {
                            let [name, plugin] = plugins[i]
                            if (plugin) {
                                if (plugin.status.active) {
                                    if (plugin.status.error === "Naming Collision") {
                                        console.log(`\x1b[33m${name}\x1b[0m (${plugin.manifest.name}) - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                    } else {
                                        console.log(`\x1b[32m${name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                    }
                                } else {
                                    if (plugin.status.error === "Plugin Unloaded") {
                                        console.log(`\x1b[2m${name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                    } else {
                                        console.log(`\x1b[31m${name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                                        console.log(` - Error: ${plugin.status.error}`)
                                    }
                                }
                            }
                        }
                    }
                    console.log("\n\x1b[34mTip!\x1b[0m Get detailed info on a specific plugin by using \x1b[2m\x1b[32mplugin info <plugin name>\x1b[0m")
                }
                break;

            case "unload":
                if (args[1]) {
                    if (args[1] === "all") {
                        this.pm.unloadAll();
                    }
                }
                break;


            case "load":
                if (args[1]) {
                    if (args[1] === "all") {
                        await this.pm.loadAll(this.config);
                    }
                }
                break;

            case "reload":
                if (args[1]) {
                    if (args[1] === "all") {
                        this.pm.unloadAll();
                        await this.pm.loadAll(this.config);
                    }
                }

                break;

            default:
                console.log("Unknown subcommand - ", args[0]);
        }

        console.log();
    }
}



// function showTime(showColon: boolean) {
//     let date = new Date();
//     let hours = date.getHours();
//     let minutes = date.getMinutes();
//     let ampm = hours >= 12 ? 'pm' : 'am';
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'
//     let sminutes = minutes < 10 ? '0' + minutes : minutes.toString();
//     if (showColon) return "\x1b[2m\x1b[32m" + hours + ':' + sminutes + ' ' + ampm + "\x1b[0m";
//     return "\x1b[2m\x1b[32m" + hours + ' ' + sminutes + ' ' + ampm + "\x1b[0m";
// }