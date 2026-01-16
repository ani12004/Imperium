
import emojis from "../../utils/emojis.js";

export default {
    name: "previous",
    description: "Play the previous track",
    permissions: [],
    aliases: ["prev", "back"],
    async execute(message, args, client) {
        const queue = client.distube.getQueue(message);
        if (!queue) return message.reply(`${emojis.ERROR} Nothing is playing.`);

        try {
            await queue.previous();
            message.react(emojis.MUSIC_PREV || '⏮️');
        } catch (e) {
            message.reply(`${emojis.ERROR} No previous song found/available.`);
        }
    }
};
