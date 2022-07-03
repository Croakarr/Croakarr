export default interface PluginManifest {
    internalPath?: any;
    name: string,
    version: string,
    description: string | undefined,
    homepage: string | undefined,
    author: string,
    entrypoint: string
}