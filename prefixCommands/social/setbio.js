import { EmbedBuilder } from "discord.js";
import { updateEconomy } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "setbio",
    description: "Set your profile bio.",
    async execute(message, args) {
        const bio = args.join(" ");
        if (!bio) return message.reply("Usage: `s?setbio <text>`");

        if (bio.length > 200) return message.reply(`${emojis.ERROR} Bio is too long (max 200 chars).`);

        updateEconomy(message.author.id, { bio: bio });

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`${emojis.SUCCESS} **Bio updated!** Check it with \`s?profile\`.`);

        message.channel.send({ embeds: [embed] });
    },
};
