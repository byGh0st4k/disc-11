"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeCommand = void 0;
const tslib_1 = require("tslib");
const BaseCommand_1 = require("../structures/BaseCommand");
const DefineCommand_1 = require("../utils/decorators/DefineCommand");
const MusicHelper_1 = require("../utils/decorators/MusicHelper");
const createEmbed_1 = require("../utils/createEmbed");
let VolumeCommand = class VolumeCommand extends BaseCommand_1.BaseCommand {
    execute(message, args) {
        var _a;
        let volume = Number(args[0]);
        if (isNaN(volume))
            return message.channel.send(createEmbed_1.createEmbed("info", `🔊 **|** El acutal volumen es **\`${message.guild.queue.volume.toString()}\`**`));
        if (volume < 0)
            volume = 0;
        if (volume === 0)
            return message.channel.send(createEmbed_1.createEmbed("error", "Por favor pausa el reproductor en lugar de poner el volumen a **\`0\`**"));
        if (Number(args[0]) > this.client.config.maxVolume) {
            return message.channel.send(createEmbed_1.createEmbed("error", `No puedo subir el volumen tanto **\`${this.client.config.maxVolume}\`**`));
        }
        message.guild.queue.volume = Number(args[0]);
        (_a = message.guild.queue.connection) === null || _a === void 0 ? void 0 : _a.dispatcher.setVolume(Number(args[0]) / this.client.config.maxVolume);
        message.channel.send(createEmbed_1.createEmbed("info", `🔊 **|** El volumen ha cambiado a **\`${args[0]}\`**`)).catch(console.error);
    }
};
tslib_1.__decorate([
    MusicHelper_1.isUserInTheVoiceChannel(),
    MusicHelper_1.isMusicPlaying(),
    MusicHelper_1.isSameVoiceChannel(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Array]),
    tslib_1.__metadata("design:returntype", Object)
], VolumeCommand.prototype, "execute", null);
VolumeCommand = tslib_1.__decorate([
    DefineCommand_1.DefineCommand({
        aliases: ["vol"],
        name: "volume",
        description: "Muestra o cambia el volumen de tu musica",
        usage: "{prefix}volume [new volume]"
    })
], VolumeCommand);
exports.VolumeCommand = VolumeCommand;
