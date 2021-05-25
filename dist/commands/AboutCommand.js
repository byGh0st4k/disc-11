"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutCommand = void 0;
const tslib_1 = require("tslib");
const BaseCommand_1 = require("../structures/BaseCommand");
const discord_js_1 = require("discord.js");
const os_1 = require("os");
const path_1 = tslib_1.__importDefault(require("path"));
const formatMS_1 = require("../utils/formatMS");
const DefineCommand_1 = require("../utils/decorators/DefineCommand");
const createEmbed_1 = require("../utils/createEmbed");
let AboutCommand = class AboutCommand extends BaseCommand_1.BaseCommand {
    async execute(message) {
        var _a;
        const opusEncoderName = this.getOpusEncoder().name;
        message.channel.send(createEmbed_1.createEmbed("info", `
\`\`\`asciidoc
Número de Usuarios        :: ${await this.client.getUsersCount()}
Número de Canales     :: ${await this.client.getChannelsCount()}
Número de Guilds       :: ${await this.client.getGuildsCount()}
Recuento de Fragmentos       :: ${this.client.shard ? `${this.client.shard.count}` : "N/A"}
ID           :: ${this.client.shard ? `${this.client.shard.ids[0]}` : "N/A"}
Música Sonando En   :: ${await this.client.getTotalPlaying()} guilds

Plataforma           :: ${process.platform}
Arquitectura               :: ${process.arch}
Tiempo de actividad del sistema operativo          :: ${formatMS_1.formatMS(os_1.uptime() * 1000)}
Memoria             :: ${this.bytesToSize(await this.client.getTotalMemory("rss"))}
Tiempo de actividad del proceso     :: ${formatMS_1.formatMS(process.uptime() * 1000)}
Tiempo de Actividad de Bot         :: ${formatMS_1.formatMS(this.client.uptime)}

Node.js version    :: ${process.version}
Discord.js version :: v${discord_js_1.version}
FFmpeg version     :: v${(await Promise.resolve().then(() => tslib_1.__importStar(require(this.getPackageJSON("ffmpeg-static")))))["ffmpeg-static"]["binary-release-name"]}
YTDL-Core version  :: v${(await Promise.resolve().then(() => tslib_1.__importStar(require(this.getPackageJSON("ytdl-core"))))).version}
Opus Encoder       :: ${opusEncoderName} v${(await Promise.resolve().then(() => tslib_1.__importStar(require(this.getPackageJSON(opusEncoderName))))).version}
Bot Version        :: v${(await Promise.resolve().then(() => tslib_1.__importStar(require(path_1.default.resolve(process.cwd(), "package.json"))))).version}
Data Strategy      :: ${await this.client.config.YouTubeDataRetrievingStrategy === "api" ? "REST API" : "HTML SCRAPING"}
\`\`\`
        `)
            .setAuthor(`${(_a = this.client.user) === null || _a === void 0 ? void 0 : _a.username} - Información de mis capacidades humildes de bot`)).catch(e => this.client.logger.error("ABOUT_CMD_ERR:", e));
    }
    bytesToSize(bytes) {
        if (isNaN(bytes) && bytes !== 0)
            throw new Error(`[bytesToSize] (bytes) Error: bytes is not a Number/Integer, received: ${typeof bytes}`);
        const sizes = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
        if (bytes < 2 && bytes > 0)
            return `${bytes} Byte`;
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        if (i === 0)
            return `${bytes} ${sizes[i]}`;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (sizes[i] === undefined)
            return `${bytes} ${sizes[sizes.length - 1]}`;
        return `${Number(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }
    getPackageJSON(pkgName) {
        if (process.platform === "win32")
            pkgName = pkgName.replace("/", "\\");
        const resolvedPath = path_1.default.resolve(require.resolve(pkgName));
        return path_1.default.resolve(resolvedPath.split(pkgName)[0], pkgName, "package.json");
    }
    getOpusEncoder() {
        const list = ["@discordjs/opus", "opusscript"];
        const errorLog = [];
        for (const name of list) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const data = require(name);
                data.name = name;
                return data;
            }
            catch (e) {
                errorLog.push(e);
            }
        }
        throw new Error(errorLog.join("\n"));
    }
};
AboutCommand = tslib_1.__decorate([
    DefineCommand_1.DefineCommand({
        aliases: ["botinfo", "info", "stats"],
        name: "about",
        description: "Manda Información sobre el bot",
        usage: "{prefix}about"
    })
], AboutCommand);
exports.AboutCommand = AboutCommand;
