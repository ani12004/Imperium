import { EmbedBuilder } from "discord.js";
import { getEconomy, updateEconomy } from "../../utils/database.js";
import { checkRules } from "../../utils/checkRules.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "daily",
    description: "Claim your daily reward.",
    async execute(message, args) {
        if (!await checkRules(message, message.author.id)) return;

        const userId = message.author.id;
        const user = getEconomy(userId);

        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        const now = Date.now();

        if (now - user.last_daily < cooldown) {
            const remaining = cooldown - (now - user.last_daily);
            const hours = Math.floor(remaining / 3600000);
            return message.reply(`${emojis.LOADING} You can claim your daily in **${hours} hours**.`);
        }

        const reward = 1000;

        updateEconomy(userId, {
            balance: user.balance + reward,
            last_daily: now
        });

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setDescription(`${emojis.MONEY_BAG} You claimed your daily reward of **${emojis.COIN}${reward}**!`);

        message.channel.send({ embeds: [embed] });
    },
};
