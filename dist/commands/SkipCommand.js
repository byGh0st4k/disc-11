"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipCommand = void 0;
const tslib_1 = require("tslib");
const BaseCommand_1 = require("../structures/BaseCommand");
const DefineCommand_1 = require("../utils/decorators/DefineCommand");
const MusicHelper_1 = require("../utils/decorators/MusicHelper");
const createEmbed_1 = require("../utils/createEmbed");
let SkipCommand = class SkipCommand extends BaseCommand_1.BaseCommand {
    execute(message) {
        var _a, _b, _c, _d, _e, _f;
        message.guild.queue.playing = true;
        (_b = (_a = message.guild.queue) === null || _a === void 0 ? void 0 : _a.connection) === null || _b === void 0 ? void 0 : _b.dispatcher.resume();
        (_d = (_c = message.guild.queue) === null || _c === void 0 ? void 0 : _c.connection) === null || _d === void 0 ? void 0 : _d.dispatcher.end();
        const song = (_f = (_e = message.guild) === null || _e === void 0 ? void 0 : _e.queue) === null || _f === void 0 ? void 0 : _f.songs.first();
        message.channel.send(createEmbed_1.createEmbed("info", `⏭ **|** Canción Skipeada **[${song.title}](${song.url}})**`)
            .setThumbnail(song === null || song === void 0 ? void 0 : song.thumbnail)).catch(e => this.client.logger.error("SKIP_CMD_ERR:", e));
    }
};
tslib_1.__decorate([
    MusicHelper_1.isUserInTheVoiceChannel(),
    MusicHelper_1.isMusicPlaying(),
    MusicHelper_1.isSameVoiceChannel(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Object)
], SkipCommand.prototype, "execute", null);
SkipCommand = tslib_1.__decorate([
    DefineCommand_1.DefineCommand({
        aliases: ["s"],
        name: "skip",
        description: "Skipea la actual Canción",
        usage: "{prefix}skip"
    })
], SkipCommand);
exports.SkipCommand = SkipCommand;
