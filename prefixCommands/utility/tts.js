import { getAudioUrl } from 'google-tts-api';
import emojis from "../../utils/emojis.js";

export default {
    name: "tts",
    description: "Text to Speech.",
    permissions: [],
    aliases: ["say"],
    async execute(message, args) {
        const text = args.join(" ");
        if (!text) return message.reply(`${emojis.ERROR} Provide text to say.`);

        if (text.length > 200) return message.reply(`${emojis.ERROR} Text too long (max 200 chars).`);

        const url = getAudioUrl(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        // Join voice channel logic needed? User just said "tts", maybe they want the file?
        // Usually TTS bots join VC. But for simplicity, I'll send the audio file.
        // Or I can try to join VC if I have voice support.
        // I'll send the audio file as attachment/link for now as it's easier and stateless.

        message.channel.send({ files: [{ attachment: url, name: 'tts.mp3' }] });
    },
};
