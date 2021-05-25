"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayCommand = void 0;
const tslib_1 = require("tslib");
/* eslint-disable block-scoped-var, @typescript-eslint/restrict-template-expressions */
const BaseCommand_1 = require("../structures/BaseCommand");
const ServerQueue_1 = require("../structures/ServerQueue");
const discord_js_1 = require("discord.js");
// @ts-expect-error-next-line
const spotify_url_info_1 = require("spotify-url-info");
const ytsr_1 = tslib_1.__importDefault(require("ytsr"));
const entities_1 = require("entities");
const DefineCommand_1 = require("../utils/decorators/DefineCommand");
const MusicHelper_1 = require("../utils/decorators/MusicHelper");
const createEmbed_1 = require("../utils/createEmbed");
let PlayCommand = class PlayCommand extends BaseCommand_1.BaseCommand {
    async execute(message, args) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const voiceChannel = message.member.voice.channel;
        if (!args[0]) {
            return message.channel.send(createEmbed_1.createEmbed("error", `Uso invalido del comando, revisa **\`${this.client.config.prefix}comandos play\`** para más información`));
        }
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");
        if (((_a = message.guild) === null || _a === void 0 ? void 0 : _a.queue) !== null && voiceChannel.id !== ((_c = (_b = message.guild) === null || _b === void 0 ? void 0 : _b.queue.voiceChannel) === null || _c === void 0 ? void 0 : _c.id)) {
            return message.channel.send(createEmbed_1.createEmbed("warn", `El reproductor de musica ya esta sonando en el **${(_e = (_d = message.guild) === null || _d === void 0 ? void 0 : _d.queue.voiceChannel) === null || _e === void 0 ? void 0 : _e.name}** canal de voz`));
        }
        if (/^https?:\/\/(www\.youtube\.com|youtube.com)\/playlist(.*)$/.exec(url)) {
            try {
                const id = new URL(url).searchParams.get("list");
                const playlist = await this.client.youtube.getPlaylist(id);
                const videos = await playlist.getVideos();
                let skippedVideos = 0;
                const addingPlaylistVideoMessage = await message.channel.send(createEmbed_1.createEmbed("info", `Añadiendo videos de **[${playlist.title}](${playlist.url})** en playlist, espera...`)
                    .setThumbnail(playlist.thumbnailURL));
                for (const video of Object.values(videos)) {
                    if (video.isPrivate) {
                        skippedVideos++;
                        continue;
                    }
                    else {
                        const video2 = await this.client.youtube.getVideo(video.id);
                        await this.handleVideo(video2, message, voiceChannel, true);
                    }
                }
                if (skippedVideos !== 0) {
                    message.channel.send(createEmbed_1.createEmbed("warn", `${skippedVideos} ${skippedVideos >= 2 ? `videos` : `video`} fue saltados porque es un video privado`)).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                }
                message.channel.messages.fetch(addingPlaylistVideoMessage.id, false).then(m => m.delete()).catch(e => this.client.logger.error("YT_PLAYLIST_ERR:", e));
                if (skippedVideos === playlist.itemCount) {
                    return message.channel.send(createEmbed_1.createEmbed("error", `Failed to load playlist **[${playlist.title}](${playlist.url})** because all of the items are private videos`)
                        .setThumbnail(playlist.thumbnailURL));
                }
                return message.channel.send(createEmbed_1.createEmbed("info", `✅ **|** Todos los videos en **[${playlist.title}](${playlist.url})** la playlist se añadió a la lista de espera`)
                    .setThumbnail(playlist.thumbnailURL));
            }
            catch (e) {
                this.client.logger.error("YT_PLAYLIST_ERR:", new Error(e.stack));
                return message.channel.send(createEmbed_1.createEmbed("error", `No pude cargar la playlist\nError: **\`${e.message}\`**`));
            }
        }
        else if (/^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/g.exec(url)) {
            const input = /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/g.exec(url);
            if (input[1] === "track") {
                const trackData = await spotify_url_info_1.getData(url);
                const trackSearchString = `${trackData.artists[0].name} - ${trackData.name}`;
                const videoResult = await ytsr_1.default(trackSearchString, { limit: 1, safeSearch: false });
                const queuedVideo = await this.client.youtube.getVideo(videoResult.items[0].id);
                return this.handleVideo(queuedVideo, message, voiceChannel);
            }
            else if (input[1] === "playlist") {
                try {
                    const playlistData = await spotify_url_info_1.getData(url);
                    const playlistSearchStrings = await playlistData.tracks.items.map((item) => `${item.track.artists[0].name} - ${item.track.name}`);
                    this.client.logger.debug(playlistSearchStrings.join("\n"));
                    const addingPlaylistVideoMessage = await message.channel.send(createEmbed_1.createEmbed("info", `Añadiendo todas las canciones en **[${playlistData.name}](${playlistData.external_urls.spotify})** playlist, espera...`)
                        .setThumbnail(playlistData.images[0].url));
                    for (const title of playlistSearchStrings) {
                        const videoResults = await ytsr_1.default(title, { limit: 1, safeSearch: false });
                        const queuedVideo = await this.client.youtube.getVideo(videoResults.items[0].id);
                        await this.handleVideo(queuedVideo, message, voiceChannel, true);
                    }
                    message.channel.messages.fetch(addingPlaylistVideoMessage.id, false).then(m => m.delete()).catch(e => this.client.logger.error("SP_PLAYLIST_ERR:", e));
                    return message.channel.send(createEmbed_1.createEmbed("info", `✅ **|** Toda las canciones en **[${playlistData.name}](${playlistData.external_urls.spotify})** la playlist se ha añadido a la lista de espera`)
                        .setThumbnail(playlistData.images[0].url));
                }
                catch (e) {
                    this.client.logger.error("SP_PLAYLIST_ERR:", new Error(e.stack));
                    return message.channel.send(createEmbed_1.createEmbed("error", `No pude cargar la playlist\nError: **\`${e.message}\`**`));
                }
            }
            else {
                try {
                    const albumData = await spotify_url_info_1.getData(url);
                    const playlistSearchStrings = await albumData.tracks.items.map((item) => `${item.artists[0].name} - ${item.name}`);
                    this.client.logger.debug(playlistSearchStrings.join("\n"));
                    const addingPlaylistVideoMessage = await message.channel.send(createEmbed_1.createEmbed("info", `Añadiendo Canciones en **[${albumData.name}](${albumData.external_urls.spotify})** playlist, espera...`)
                        .setThumbnail(albumData.images[0].url));
                    for (const title of playlistSearchStrings) {
                        const videoResults = await this.client.youtube.searchVideos(title, 1);
                        const queuedVideo = await this.client.youtube.getVideo(videoResults[0].id);
                        await this.handleVideo(queuedVideo, message, voiceChannel, true);
                    }
                    message.channel.messages.fetch(addingPlaylistVideoMessage.id, false).then(m => m.delete()).catch(e => this.client.logger.error("SP_PLAYLIST_ERR:", e));
                    return message.channel.send(createEmbed_1.createEmbed("info", `✅ **|** Todas las canciones en **[${albumData.name}](${albumData.external_urls.spotify})** la playlist se ha añadido a la lista de espera`)
                        .setThumbnail(albumData.images[0].url));
                }
                catch (e) {
                    this.client.logger.error("SP_PLAYLIST_ERR:", new Error(e.stack));
                    return message.channel.send(createEmbed_1.createEmbed("error", `No pude cargar la playlist\nError: **\`${e.message}\`**`));
                }
            }
        }
        else {
            try {
                const id = new URL(url).searchParams.get("v");
                // eslint-disable-next-line no-var, block-scoped-var
                var video = await this.client.youtube.getVideo(id);
            }
            catch (e) {
                try {
                    const videos = await this.client.youtube.searchVideos(searchString, this.client.config.searchMaxResults);
                    if (videos.length === 0)
                        return message.channel.send(createEmbed_1.createEmbed("error", "No encontre ningun resultado"));
                    if (this.client.config.disableSongSelection) {
                        video = await this.client.youtube.getVideo(videos[0].id);
                    }
                    else {
                        let index = 0;
                        const msg = await message.channel.send(new discord_js_1.MessageEmbed()
                            .setColor(this.client.config.embedColor)
                            .setAuthor("Selección de Canción", (_f = message.client.user) === null || _f === void 0 ? void 0 : _f.displayAvatarURL())
                            .setDescription(`\`\`\`${videos.map(video => `${++index} - ${this.cleanTitle(video.title)}`).join("\n")}\`\`\`` +
                            "\nSelecciona uno de los resultados escribienedo desde **\`1-10\`**")
                            .setFooter("• Escribe c para cancelar la opereación..."));
                        try {
                            // eslint-disable-next-line no-var
                            var response = await message.channel.awaitMessages((msg2) => {
                                if (message.author.id !== msg2.author.id)
                                    return false;
                                if (msg2.content === "cancel" || msg2.content === "c")
                                    return true;
                                return Number(msg2.content) > 0 && Number(msg2.content) < 13;
                            }, {
                                max: 1,
                                time: this.client.config.selectTimeout,
                                errors: ["time"]
                            });
                            msg.delete().catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                            (_g = response.first()) === null || _g === void 0 ? void 0 : _g.delete({ timeout: 3000 }).catch(e => e);
                        }
                        catch (error) {
                            msg.delete().catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                            return message.channel.send(createEmbed_1.createEmbed("error", "No se ha seleccionado una canción. Vuelve a intentarlo"));
                        }
                        if (((_h = response.first()) === null || _h === void 0 ? void 0 : _h.content) === "c" || ((_j = response.first()) === null || _j === void 0 ? void 0 : _j.content) === "cancel") {
                            return message.channel.send(createEmbed_1.createEmbed("warn", "La selección de la canción se ha cancelado"));
                        }
                        const videoIndex = parseInt((_k = response.first()) === null || _k === void 0 ? void 0 : _k.content);
                        video = await this.client.youtube.getVideo(videos[videoIndex - 1].id);
                    }
                }
                catch (err) {
                    this.client.logger.error("YT_SEARCH_ERR:", err);
                    return message.channel.send(createEmbed_1.createEmbed("error", `No obtuve ningun resultado de la busqueda\nError: **\`${err.message}\`**`));
                }
                return this.handleVideo(video, message, voiceChannel);
            }
            return this.handleVideo(video, message, voiceChannel);
        }
    }
    async handleVideo(video, message, voiceChannel, playlist = false) {
        var _a, _b, _c;
        const song = {
            id: video.id,
            title: this.cleanTitle(video.title),
            url: video.url,
            thumbnail: video.thumbnailURL
        };
        if ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.queue) {
            if (!this.client.config.allowDuplicate && message.guild.queue.songs.find(s => s.id === song.id)) {
                return message.channel.send(createEmbed_1.createEmbed("aviso", `🎶 **|** **[${song.title}](${song.url})** ya esta en la lista de espera, ` +
                    `utiliza **\`${this.client.config.prefix}repetir\`** comando`)
                    .setTitle("Ya en lista de espera"));
            }
            message.guild.queue.songs.addSong(song);
            if (!playlist) {
                message.channel.send(createEmbed_1.createEmbed("info", `✅ **|** **[${song.title}](${song.url})** se añadio a la lista de espera`).setThumbnail(song.thumbnail))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            }
        }
        else {
            message.guild.queue = new ServerQueue_1.ServerQueue(message.channel, voiceChannel);
            (_b = message.guild) === null || _b === void 0 ? void 0 : _b.queue.songs.addSong(song);
            if (!playlist) {
                message.channel.send(createEmbed_1.createEmbed("info", `✅ **|** **[${song.title}](${song.url})** se añadio a la lista de espera`).setThumbnail(song.thumbnail))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            }
            try {
                const connection = await message.guild.queue.voiceChannel.join();
                message.guild.queue.connection = connection;
            }
            catch (error) {
                (_c = message.guild) === null || _c === void 0 ? void 0 : _c.queue.songs.clear();
                message.guild.queue = null;
                this.client.logger.error("PLAY_CMD_ERR:", error);
                message.channel.send(createEmbed_1.createEmbed("error", `Ocurrio un error al entrar al canal de voz, razon: **\`${error.message}\`**`))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return undefined;
            }
            this.play(message.guild).catch(err => {
                message.channel.send(createEmbed_1.createEmbed("error", `Ocurrio un error al reproducir la musica, razon: **\`${err.message}\`**`))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return this.client.logger.error("PLAY_CMD_ERR:", err);
            });
        }
        return message;
    }
    async play(guild) {
        var _a, _b, _c, _d, _e, _f, _g;
        const serverQueue = guild.queue;
        const song = serverQueue.songs.first();
        if (!song) {
            if (serverQueue.lastMusicMessageID !== null)
                (_a = serverQueue.textChannel) === null || _a === void 0 ? void 0 : _a.messages.fetch(serverQueue.lastMusicMessageID, false).then(m => m.delete()).catch(e => this.client.logger.error("PLAY_ERR:", e));
            if (serverQueue.lastVoiceStateUpdateMessageID !== null)
                (_b = serverQueue.textChannel) === null || _b === void 0 ? void 0 : _b.messages.fetch(serverQueue.lastVoiceStateUpdateMessageID, false).then(m => m.delete()).catch(e => this.client.logger.error("PLAY_ERR:", e));
            (_c = serverQueue.textChannel) === null || _c === void 0 ? void 0 : _c.send(createEmbed_1.createEmbed("info", `⏹ **|** Las canciones se han acabado, usa **\`${guild.client.config.prefix}play\`** para reproducir musica de nuevo`)).catch(e => this.client.logger.error("PLAY_ERR:", e));
            (_d = serverQueue.connection) === null || _d === void 0 ? void 0 : _d.disconnect();
            return guild.queue = null;
        }
        (_f = (_e = serverQueue.connection) === null || _e === void 0 ? void 0 : _e.voice) === null || _f === void 0 ? void 0 : _f.setSelfDeaf(true).catch(e => this.client.logger.error("PLAY_ERR:", e));
        const songData = await this.client.youtube.downloadVideo(song.url, {
            cache: this.client.config.cacheYoutubeDownloads,
            cacheMaxLength: this.client.config.cacheMaxLengthAllowed,
            skipFFmpeg: true
        });
        if (songData.cache)
            this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Using cache for music "${song.title}" on ${guild.name}`);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        songData.on("error", err => { var _a, _b; err.message = `YTDLError: ${err.message}`; (_b = (_a = serverQueue.connection) === null || _a === void 0 ? void 0 : _a.dispatcher) === null || _b === void 0 ? void 0 : _b.emit("error", err); });
        (_g = serverQueue.connection) === null || _g === void 0 ? void 0 : _g.play(songData, { type: songData.info.canSkipFFmpeg ? "webm/opus" : "unknown", bitrate: "auto", highWaterMark: 1 }).on("start", () => {
            var _a, _b;
            serverQueue.playing = true;
            this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Music: "${song.title}" on ${guild.name} has started`);
            if (serverQueue.lastMusicMessageID !== null)
                (_a = serverQueue.textChannel) === null || _a === void 0 ? void 0 : _a.messages.fetch(serverQueue.lastMusicMessageID, false).then(m => m.delete()).catch(e => this.client.logger.error("PLAY_ERR:", e));
            (_b = serverQueue.textChannel) === null || _b === void 0 ? void 0 : _b.send(createEmbed_1.createEmbed("info", `▶ **|** Sonando: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail)).then(m => serverQueue.lastMusicMessageID = m.id).catch(e => this.client.logger.error("PLAY_ERR:", e));
        }).on("finish", () => {
            var _a, _b;
            this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Musica: "${song.title}" en ${guild.name} se ha detenido`);
            // eslint-disable-next-line max-statements-per-line
            if (serverQueue.loopMode === 0) {
                serverQueue.songs.deleteFirst();
            }
            else if (serverQueue.loopMode === 2) {
                serverQueue.songs.deleteFirst();
                serverQueue.songs.addSong(song);
            }
            if (serverQueue.lastMusicMessageID !== null)
                (_a = serverQueue.textChannel) === null || _a === void 0 ? void 0 : _a.messages.fetch(serverQueue.lastMusicMessageID, false).then(m => m.delete()).catch(e => this.client.logger.error("PLAY_ERR:", e));
            (_b = serverQueue.textChannel) === null || _b === void 0 ? void 0 : _b.send(createEmbed_1.createEmbed("info", `⏹ **|** Se ha detenido la música **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail)).then(m => serverQueue.lastMusicMessageID = m.id).catch(e => this.client.logger.error("PLAY_ERR:", e)).finally(() => {
                this.play(guild).catch(e => {
                    var _a, _b;
                    (_a = serverQueue.textChannel) === null || _a === void 0 ? void 0 : _a.send(createEmbed_1.createEmbed("error", `Un error ha ocurrido al intentar reproducir la musica, razon: **\`${e}\`**`)).catch(e => this.client.logger.error("PLAY_ERR:", e));
                    (_b = serverQueue.connection) === null || _b === void 0 ? void 0 : _b.dispatcher.end();
                    return this.client.logger.error("PLAY_ERR:", e);
                });
            });
        }).on("error", (err) => {
            var _a, _b, _c;
            (_a = serverQueue.textChannel) === null || _a === void 0 ? void 0 : _a.send(createEmbed_1.createEmbed("error", `Ocurrio un error mientras sonaba la musica, razon: **\`${err.message}\`**`)).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            (_c = (_b = guild.queue) === null || _b === void 0 ? void 0 : _b.voiceChannel) === null || _c === void 0 ? void 0 : _c.leave();
            guild.queue = null;
            this.client.logger.error("PLAY_ERR:", err);
        }).setVolume(serverQueue.volume / guild.client.config.maxVolume);
    }
    cleanTitle(title) {
        return discord_js_1.Util.escapeMarkdown(entities_1.decodeHTML(title));
    }
};
tslib_1.__decorate([
    MusicHelper_1.isUserInTheVoiceChannel(),
    MusicHelper_1.isValidVoiceChannel(),
    MusicHelper_1.isSameVoiceChannel(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Array]),
    tslib_1.__metadata("design:returntype", Promise)
], PlayCommand.prototype, "execute", null);
PlayCommand = tslib_1.__decorate([
    DefineCommand_1.DefineCommand({
        aliases: ["p", "add", "play-music"],
        name: "play",
        description: "Reproduce tu humilde musica",
        usage: "{prefix}play <video de youtube o link de playlist spotify | nombre de video de youtube>"
    })
], PlayCommand);
exports.PlayCommand = PlayCommand;
