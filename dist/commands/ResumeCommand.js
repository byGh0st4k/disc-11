"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeCommand = void 0;
const tslib_1 = require("tslib");
const BaseCommand_1 = require("../structures/BaseCommand");
const DefineCommand_1 = require("../utils/decorators/DefineCommand");
const MusicHelper_1 = require("../utils/decorators/MusicHelper");
const createEmbed_1 = require("../utils/createEmbed");
let ResumeCommand = class ResumeCommand extends BaseCommand_1.BaseCommand {
    execute(message) {
        var _a, _b, _c, _d, _e;
        if ((_b = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.queue) === null || _b === void 0 ? void 0 : _b.playing) {
            message.channel.send(createEmbed_1.createEmbed("error", "El reproductor no esta pausado")).catch(e => this.client.logger.error("RESUME_CMD_ERR:", e));
        }
        else {
            message.guild.queue.playing = true;
            (_e = (_d = (_c = message.guild) === null || _c === void 0 ? void 0 : _c.queue) === null || _d === void 0 ? void 0 : _d.connection) === null || _e === void 0 ? void 0 : _e.dispatcher.resume();
            message.channel.send(createEmbed_1.createEmbed("info", "▶ **|** El reproductor se ha reanudado")).catch(e => this.client.logger.error("RESUME_CMD_ERR:", e));
        }
    }
};
tslib_1.__decorate([
    MusicHelper_1.isUserInTheVoiceChannel(),
    MusicHelper_1.isMusicPlaying(),
    MusicHelper_1.isSameVoiceChannel(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Object)
], ResumeCommand.prototype, "execute", null);
ResumeCommand = tslib_1.__decorate([
    DefineCommand_1.DefineCommand({
        aliases:["finalizareset"],
        name: "resume",
        description: "Reanuda el reproductor si esta pausado",
        usage: "{prefix}resume"
    })
], ResumeCommand);
exports.ResumeCommand = ResumeCommand;
