import { EmbedBuilder } from "discord.js";
import { getEconomy, updateEconomy } from "../../utils/database.js";
import { checkRules } from "../../utils/checkRules.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "deposit",
    description: "Deposit money into your bank.",
    aliases: ["dep"],
    async execute(message, args) {
        if (!await checkRules(message, message.author.id)) return;

        const user = getEconomy(message.author.id);
        let amount = args[0];

        if (!amount) return message.reply("Usage: `s?dep <amount|all>`");

        if (amount.toLowerCase() === "all") {
            amount = user.balance;
        } else {
            amount = parseInt(amount);
        }

        if (isNaN(amount) || amount <= 0) {
            return message.reply(`$${emojis.ERROR} Please provide a valid amount.`);
        }

        if (user.balance < amount) {
            return message.reply(`${emojis.ERROR} You don't have enough money in your wallet.`);
        }

        updateEconomy(message.author.id, {
            balance: user.balance - amount,
            bank: user.bank + amount
        });

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setColor("Green")
            .setDescription(`${emojis.BANK} You deposited **${emojis.COIN}${amount}** into your bank.`);

        message.channel.send({ embeds: [embed] });
    },
};
