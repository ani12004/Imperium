import { EmbedBuilder } from "discord.js";
import { getEconomy, updateEconomy } from "../../utils/database.js";
import { checkRules } from "../../utils/checkRules.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "slots",
    description: "Play slots to win money.",
    aliases: ["slot"],
    async execute(message, args) {
        if (!await checkRules(message, message.author.id)) return;

        const amount = parseInt(args[0]);
        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply("Usage: `s?slots <bet>`");
        }

        const user = getEconomy(message.author.id);
        if (user.balance < amount) {
            return message.reply(`${emojis.ERROR} You don't have enough money.`);
        }

        const slots = ["🍒", "🍋", "🍇", "🍉", "🔔", "💎", "7️⃣"];
        const slot1 = slots[Math.floor(Math.random() * slots.length)];
        const slot2 = slots[Math.floor(Math.random() * slots.length)];
        const slot3 = slots[Math.floor(Math.random() * slots.length)];

        const embed = new EmbedBuilder()
            .setTitle(`${emojis.SLOT} Slots ${emojis.SLOT}`)
            .setDescription(`| ${slot1} | ${slot2} | ${slot3} |`)
            .setColor("Gold");

        if (slot1 === slot2 && slot2 === slot3) {
            const winnings = amount * 5;
            updateEconomy(message.author.id, { balance: user.balance + winnings });
            embed.addFields({ name: "Result", value: `${emojis.TROPHY} **JACKPOT!** You won **${emojis.COIN}${winnings}**!` });
            embed.setColor("Green");
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            const winnings = Math.floor(amount * 1.5);
            updateEconomy(message.author.id, { balance: user.balance + winnings });
            embed.addFields({ name: "Result", value: `${emojis.TROPHY} **Winner!** You won **${emojis.COIN}${winnings}**!` });
            embed.setColor("Green");
        } else {
            updateEconomy(message.author.id, { balance: user.balance - amount });
            embed.addFields({ name: "Result", value: `${emojis.ERROR} **You Lost!** Better luck next time.` });
            embed.setColor("Red");
        }

        message.channel.send({ embeds: [embed] });
    },
};
