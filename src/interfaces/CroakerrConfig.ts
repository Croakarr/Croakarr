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
        "plugins"
    ]
}