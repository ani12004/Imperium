import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "google",
    description: "Search Google.",
    permissions: [],
    aliases: ["search"],
    async execute(message, args) {
        const query = args.join(" ");
        if (!query) return message.reply(`${emojis.ERROR} Provide a search query.`);

        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        const embed = new EmbedBuilder()
            .setColor("#4285F4")
            .setTitle(`🔍 Google Search: ${query}`)
            .setDescription(`[Click here to view results](${url})`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
