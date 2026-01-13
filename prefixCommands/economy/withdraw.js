import { EmbedBuilder } from "discord.js";
import { getEconomy, updateEconomy } from "../../utils/database.js";
import { checkRules } from "../../utils/checkRules.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "withdraw",
    description: "Withdraw money from your bank.",
    aliases: ["with"],
    async execute(message, args) {
        if (!await checkRules(message, message.author.id)) return;

        const user = getEconomy(message.author.id);
        let amount = args[0];

        if (!amount) return message.reply("Usage: `s?with <amount|all>`");

        if (amount.toLowerCase() === "all") {
            amount = user.bank;
        } else {
            amount = parseInt(amount);
        }

        if (isNaN(amount) || amount <= 0) {
            return message.reply(`${emojis.ERROR} Please provide a valid amount.`);
        }

        if (user.bank < amount) {
            return message.reply(`${emojis.ERROR} You don't have enough money in your bank.`);
        }

        updateEconomy(message.author.id, {
            balance: user.balance + amount,
            bank: user.bank - amount
        });

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setColor("Green")
            .setDescription(`${emojis.WALLET} You withdrew **${emojis.COIN}${amount}** from your bank.`);

        message.channel.send({ embeds: [embed] });
    },
};
