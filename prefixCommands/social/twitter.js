import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "twitter",
    description: "Twitter integration.",
    permissions: [],
    aliases: ["tw"],
    async execute(message, args) {
        const action = args[0];

        if (action === "login") {
            return message.reply(`${emojis.SUCCESS} Logged in to Twitter as **` + message.author.username + "**.");
        } else if (action === "post") {
            const content = args.slice(1).join(" ");
            if (!content) return message.reply(`${emojis.ERROR} Provide text to post.`);

            const embed = new EmbedBuilder()
                .setColor("#1DA1F2")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setDescription(content)
                .setFooter({ text: "Twitter for Discord", iconURL: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        } else {
            return message.reply(`${emojis.ERROR} Usage: ,twitter login | post [text]`);
        }
    },
};
