export class Logger {
    plugin: undefined | string;
    constructor(plugin: undefined | string = undefined) {
        this.plugin = plugin;
    }

    log(message: string | number) {
        if (this.plugin !== undefined) {
            console.log(`\x1b[1K\r${renderTime()}`, `\x1b[32m[  LOG  ]\x1b[0m`, `\x1b[32m[${this.plugin}]\x1b[0m`, message);
        } else console.log(`\x1b[1K\r${renderTime()}`, "\x1b[32m[  LOG  ]\x1b[0m", `\x1b[2m\x1b[37m[SYSTEM]\x1b[0m`, message);
    }

    info(message: string | number) {
        if (this.plugin !== undefined) {
            console.log(`\x1b[1K\r${renderTime()}`, `\x1b[36m[ INFO  ]\x1b[0m`, `\x1b[32m[${this.plugin}]\x1b[0m`, message);
        } else console.log(`\x1b[1K\r${renderTime()}`, "\x1b[34m[ INFO  ]\x1b[0m", `\x1b[2m\x1b[37m[SYSTEM]\x1b[0m`, message);
    }

    debug(message: string | number) {
        if (this.plugin !== undefined) {
            console.log(`\x1b[1K\r${renderTime()}`, `\x1b[36m[ DEBUG ]\x1b[0m`, `\x1b[32m[${this.plugin}]\x1b[0m`, message);
        } else console.log(`\x1b[1K\r${renderTime()}`, "\x1b[36m[ DEBUG ]\x1b[0m", `\x1b[2m\x1b[37m[SYSTEM]\x1b[0m`, message);
    }

    warn(message: string | number) {
        if (this.plugin !== undefined) {
            console.log(`\x1b[1K\r${renderTime()}`, `\x1b[33m[ WARN! ]\x1b[0m`, `\x1b[32m[${this.plugin}]\x1b[0m`, message);
        } else console.log(`\x1b[1K\r${renderTime()}`, "\x1b[33m[ WARN! ]\x1b[0m", `\x1b[2m\x1b[37m[SYSTEM]\x1b[0m`, message);
    }

    error(message: string | number) {
        if (this.plugin !== undefined) {
            console.log(`\x1b[1K\r${renderTime()}`, `\x1b[31m[ ERROR ]\x1b[0m`, `\x1b[32m[${this.plugin}]\x1b[0m`, message);
        } else console.log(`\x1b[1K\r${renderTime()}`, "\x1b[31m[ ERROR ]\x1b[0m", `\x1b[2m\x1b[37m[SYSTEM]\x1b[0m`, message);
    }
}

export default new Logger();


function renderTime() {
    return `\x1b[35m${new Date().toISOString().split("T").join(" ").split("Z").join(" UTC")}\x1b[0m `;
}