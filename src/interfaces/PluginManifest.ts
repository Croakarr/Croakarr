export default interface PluginManifest {
    internalPath?: any;
    name: string,
    version: string,
    description: string | undefined,
    homepage: string | undefined,
    auther: string,
    entrypoint: string
}