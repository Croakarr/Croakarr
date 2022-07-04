export interface CroakerrConfig {
    // The network interface to use.
    // Default: 0.0.0.0
    interface: string;

    // The port to listen on.
    // Default: 8371
    port: number;

    // Where to find Croakerr plugins.
    // Default:
    // - "plugins" - The plugin directory within Croakerr's own installation folder
    pluginDirectories: string[];

}


export const DEFAULT: CroakerrConfig = {
    interface: "0.0.0.0",
    port: 8371,
    pluginDirectories: [
        "plugins",
        "../croakerrplugins/bundles"
    ]
}


export function validator(config: any): boolean {
    let hasFields = "interface" in config
        && "port" in config
        && "pluginDirectories" in config;

    let validData = config.port > 0
        && config.port < 65535
        && /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(config.interface)
        && config.pluginDirectories instanceof Array;


    return hasFields && validData;
}