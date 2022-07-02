import { CroakerrConfig, DEFAULT } from "./interfaces/CroakerrConfig";

export async function loadConfig(): Promise<CroakerrConfig> {
    return DEFAULT;
}