export interface CroakarrConfig {
    // The network interface to use.
    // Default: 0.0.0.0
    interface: string;

    // The port to listen on.
    // Default: 8371
    port: number;

    // Where to find Croakarr plugins.
    // Default:
    // - "plugins" - The plugin directory within Croakarr's own installation folder
    pluginDirectories: string[];

    // API Interfacing services which can be resolved by the core Croakarr service
    services: {
        sonarr: Service;
        radarr: Service;
        lidarr: Service;
        plex: Service;
        ombi: Service;
        jellyfin: Service;
    }
}


export const DEFAULT: CroakarrConfig = {
    interface: "0.0.0.0",
    port: 8371,
    pluginDirectories: [
        "plugins",
        "../croakerrplugins/bundles"
    ],
    services: {
        sonarr: {
            enabled: false,
            host: null,
            port: null,
            useSSL: false,
            token: null
        },
        radarr: {
            enabled: false,
            host: null,
            port: null,
            useSSL: false,
            token: null
        },
        lidarr: {
            enabled: false,
            host: null,
            port: null,
            useSSL: false,
            token: null
        },
        plex: {
            enabled: false,
            host: null,
            port: null,
            useSSL: false,
            token: null
        },
        ombi: {
            enabled: false,
            host: null,
            port: null,
            useSSL: false,
            token: null
        },
        jellyfin: {
            enabled: false,
            host: null,
            port: null,
            useSSL: false,
            token: null
        }
    }
}


export interface Service {
    enabled: boolean;
    host: string | null;
    port: number | null;
    useSSL: boolean;
    token: string | null;
}

export function validator(config: any): boolean {
    let hasFields = "interface" in config
        && "port" in config
        && "pluginDirectories" in config;

    let validData = config.port > 0
        && config.port < 65535
        && /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(config.interface)
        && config.pluginDirectories instanceof Array
        && config.services !== undefined;


    let validServices = false;
    if (validData) {
        validServices = config.services.sonarr
            && config.services.radarr
            && config.services.lidarr
            && config.services.plex
            && config.services.ombi
            && config.services.jellyfin
    }


    return hasFields && validData && validServices;
}