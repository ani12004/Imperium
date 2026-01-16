
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
        if (!query) return message.reply(`${emojis.ERROR} Please provide a song name or link.`);

        try {
            await client.distube.play(voiceChannel, query, {
                member: message.member,
                textChannel: message.channel,
                message
            });
            message.react('🔎');
        } catch (e) {
            console.error(e);
            if (e.errorCode === 'VOICE_CONNECT_FAILED') {
                return message.reply(`${emojis.ERROR} | **Voice Connection Failed**\nCould not connect to the voice channel. Check server logs (missing native modules?).`);
            }
            message.reply(`${emojis.ERROR} An error occurred: \`${e.message}\``);
        }
    }
};