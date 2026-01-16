import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import emojis from "../utils/emojis.js";
import logger from "../utils/logger.js";

export function loadDistubeEvents(client) {
    client.distube
        .on("playSong", (queue, song) => {
            const embed = new EmbedBuilder()
                .setColor("#00ff00")
                .setDescription(`${emojis.SUCCESS || "🎶"} | Playing **[${song.name}](${song.url})** - \`${song.formattedDuration}\`\nRequested by: ${song.user}`)
                .setThumbnail(song.thumbnail);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('music_prev').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('music_pause').setEmoji('⏯️').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('music_loop').setEmoji('🔁').setStyle(ButtonStyle.Secondary)
                );

            queue.textChannel.send({ embeds: [embed], components: [row] }).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("addSong", (queue, song) => {
            const embed = new EmbedBuilder()
                .setColor("#00ff00")
                .setDescription(`${emojis.SUCCESS || "✅"} | Added **[${song.name}](${song.url})** - \`${song.formattedDuration}\` to the queue\nRequested by: ${song.user}`)
                .setThumbnail(song.thumbnail);

            queue.textChannel.send({ embeds: [embed] }).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("addList", (queue, playlist) => {
            const embed = new EmbedBuilder()
                .setColor("#00ff00")
                .setDescription(`${emojis.SUCCESS || "✅"} | Added **${playlist.name}** playlist (${playlist.songs.length} songs) to queue\nRequested by: ${playlist.user}`);

            queue.textChannel.send({ embeds: [embed] }).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("error", (channel, e) => {
            logger.error(`Distube Error: ${e}`);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription(`${emojis.ERROR || "❌"} | An error encountered: ${e.toString().slice(0, 1974)}`);
                channel.send({ embeds: [embed] }).catch(err => logger.error(`Distube Send Error: ${err}`));
            }
        })
        .on("empty", (queue) => {
            queue.textChannel.send(`${emojis.ERROR || "⚠️"} | Voice channel is empty! Leaving the channel...`).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("searchNoResult", (message, query) => {
            message.channel.send(`${emojis.ERROR || "❌"} | No result found for \`${query}\`!`).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("finish", (queue) => {
            queue.textChannel.send(`${emojis.SUCCESS || "🏁"} | Queue finished!`).catch(err => logger.error(`Distube Error: ${err}`));
        });

    logger.info("DisTube events loaded.");
}
