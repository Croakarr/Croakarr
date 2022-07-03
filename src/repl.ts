import { Server } from "net";
import { EventEmitter } from "stream";
import readline from "readline";

import PluginManager from "./helpers/PluginManager";
import { CroakerrConfig } from "./interfaces/CroakerrConfig";
import { Logger } from "./helpers/Logger";
import { resolve } from "path";

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

export default class REPL extends EventEmitter {
    server: Server;
    config: CroakerrConfig;
    pm: PluginManager;
    history: string[] = [];
    historyPosition: number = 0;
    logger: Logger;
    command: string = "";
    constructor(logger: Logger, server: Server, config: CroakerrConfig, pm: PluginManager) {
        super();
        this.server = server;
        this.config = config;
        this.pm = pm;
        this.logger = logger;
        // let interval: null | NodeJS.Timer = null;
        // let showColon: boolean = false;
        process.stdin.on('keypress', (str, key) => {
            if (key.ctrl && key.name === 'c') {
                process.exit();
            } else {
                switch (key.name) {
                    case "return":
                        process.stdout.write("\n");
                        this.eval();
                        break;
                    case "backspace":
                        this.command = this.command.substring(0, this.command.length - 1);
                        process.stdout.write("\r🐸 \x1b[32m>\x1b[0m " + this.command + "\x1b[K");
                        break;
                    case "up":
                        if (this.historyPosition + 1 <= this.history.length) {
                            this.historyPosition += 1;
                            this.command = this.history[this.history.length - this.historyPosition]
                        } else {
                            if (this.history.length === 0) {
                                this.command = "";
                            } else this.command = this.history[this.history.length - this.historyPosition]
                        }
                        break;
                    case "down":
                        if (this.historyPosition - 1 > -1) {
                            this.historyPosition -= 1;
                            this.command = this.history[this.history.length - this.historyPosition]
                        } else {
                            if (this.history.length - this.historyPosition === 0) {
                                this.command = "";
                            } else this.command = this.history[this.history.length - this.historyPosition]
                        }
                        break;
                    default:
                        this.command += str
                };

                process.stdout.write("\r🐸 \x1b[32m>\x1b[0m " + this.command);
            }
        });
        logger.log("Welcome to the Croakerr REPL.")
        logger.log("Use \x1b[32mhelp\x1b[0m for more info.\x1b[0m")
        process.stdout.write(`\r🐸 \x1b[32m>\x1b[0m `);

    }


    async eval() {
        this.history.push(this.command);
        let cmd = this.command;
        this.command = "";
        let args = cmd.split(" ");
        switch (args[0]) {
            case "exit":
                process.exit();
            case "version":
                console.log("Croakerr Version " + process.env.CROAKERR_VERSION);
                console.log();
                break;
            case "help":
                console.log("Available commands");
                console.log();
                console.log("exit            - Quits Croakerr");
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
                this.plugins(args);
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


    plugins(args: string[]) {
        switch (args[0]) {
            case "list":
                if (args[1]) {
                    console.log("filters not implemented");
                    if (this.pm.plugins.size === 0) {
                        console.log("\x1b[33mNo plugins loaded.\x1b[0m")
                    } else {
                        let plugins = Array.from(this.pm.plugins.keys());
                        for (let i = 0; i < plugins.length; i++) {
                            let name = plugins[i];
                            let plugin = this.pm.plugins.get(name);
                            if (plugin) {
                                console.log(`\x1b[32m${plugin.manifest.name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
                            }
                        }
                    }
                    console.log("\nGet detailed info on a specific plugin by using \x1b[2m\x1b[32mplugin info <plugin name>\x1b[0m")
                } else {
                    if (this.pm.plugins.size === 0) {
                        console.log("\x1b[33mNo plugins loaded.\x1b[0m")
                    } else {
                        let plugins = Array.from(this.pm.plugins.keys());
                        for (let i = 0; i < plugins.length; i++) {
                            let name = plugins[i];
                            let plugin = this.pm.plugins.get(name);
                            if (plugin) {
                                console.log(`\x1b[32m${plugin.manifest.name}\x1b[0m - ${plugin.manifest.version} (By: ${plugin.manifest.author})`)
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
                        this.pm.loadAll(this.config);
                    }
                }
                break;

            case "reload":
                if (args[1]) {
                    if (args[1] === "all") {
                        this.pm.unloadAll();
                        this.pm.loadAll(this.config);
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