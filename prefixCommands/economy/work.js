import { EmbedBuilder } from "discord.js";
import { getEconomy, updateEconomy } from "../../utils/database.js";
import { checkRules } from "../../utils/checkRules.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "work",
    description: "Work to earn money.",
    async execute(message, args) {
        if (!await checkRules(message, message.author.id)) return;

        const userId = message.author.id;
        const user = getEconomy(userId);

        const cooldown = 60 * 60 * 1000; // 1 hour
        const now = Date.now();

        if (now - user.last_work < cooldown) {
            const remaining = cooldown - (now - user.last_work);
            const minutes = Math.ceil(remaining / 60000);
            return message.reply(`${emojis.LOADING} You can work again in **${minutes} minutes**.`);
        }

        const earnings = Math.floor(Math.random() * 500) + 100;

        updateEconomy(userId, {
            balance: user.balance + earnings,
            last_work: now
        });

        const jobs = ["Programmer", "Builder", "Waiter", "Chef", "Mechanic"];
        const job = jobs[Math.floor(Math.random() * jobs.length)];

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`👷 You worked as a **${job}** and earned **${emojis.COIN}${earnings}**!`);

        message.channel.send({ embeds: [embed] });
    },
};
