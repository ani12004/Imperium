import { EmbedBuilder } from "discord.js";
import { getEconomy, updateEconomy } from "../../utils/database.js";
import { checkRules } from "../../utils/checkRules.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "pay",
    description: "Pay money to another user.",
    aliases: ["transfer"],
    async execute(message, args) {
        if (!await checkRules(message, message.author.id)) return;

        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target) return message.reply(`${emojis.ERROR} Please mention a user to pay.`);
        if (target.id === message.author.id) return message.reply(`${emojis.ERROR} You cannot pay yourself.`);
        if (isNaN(amount) || amount <= 0) return message.reply(`${emojis.ERROR} Please provide a valid amount.`);

        const sender = getEconomy(message.author.id);
        const receiver = getEconomy(target.id);

        if (sender.balance < amount) return message.reply(`${emojis.ERROR} You don't have enough money.`);

        updateEconomy(message.author.id, { balance: sender.balance - amount });
        updateEconomy(target.id, { balance: receiver.balance + amount });

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`${emojis.WALLET} You paid **${emojis.COIN}${amount}** to **${target.username}**.`);

        message.channel.send({ embeds: [embed] });
    },
};
