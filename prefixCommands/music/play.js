
import emojis from "../../utils/emojis.js";
import { PermissionsBitField } from "discord.js";

export default {
    name: "play",
    description: "Queue a track",
    permissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
    aliases: ["p"],
    async execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply(`${emojis.ERROR} You must be in a voice channel.`);

        const query = args.join(" ");
        if (!query) return message.reply(`${emojis.ERROR} Please provide a song name.`);

        try {
            await message.channel.sendTyping();

            // Search on JioSaavn
            const { searchSong, getHighestQualityUrl } = await import("../../utils/jiosaavn.js");
            const song = await searchSong(query);

            if (!song) {
                return message.reply(`${emojis.ERROR} No results found on JioSaavn for: \`${query}\``);
            }

            const streamUrl = getHighestQualityUrl(song);
            if (!streamUrl) {
                return message.reply(`${emojis.ERROR} Could not extract a playable stream for: **${song.name}**`);
            }

            // Play the direct URL
            // We pass the song name/metadata for better display if possible, or just the URL
            // Distube handles direct URLs
            await client.distube.play(voiceChannel, streamUrl, {
                member: message.member,
                textChannel: message.channel,
                message,
                metadata: {
                    originalName: song.name,
                    artist: song.artists.primary ? song.artists.primary.map(a => a.name).join(", ") : "Unknown",
                    image: song.image[song.image.length - 1]?.url // Highest res image
                }
            });

            // Feedback handled by Distube events (playSong), but we can confirm search success
            // message.react('🔎'); 
        } catch (e) {
            console.error(e);
            message.reply(`${emojis.ERROR} An error occurred: \`${e.message}\``);
        }
    }
};