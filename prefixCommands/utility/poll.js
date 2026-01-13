import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "poll",
    description: "Creates a simple yes/no poll.",
    usage: "<question>",
    aliases: ["vote"],
    async execute(message, args, client) {
        if (!args.length) {
            return message.reply("Please provide a question for the poll!");
        }

        const question = args.join(" ");

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`${emojis.TROPHY} Poll`) // Using Trophy or chart if I had one, fallback to Trophy as generic shiny or Bar chart emoji
            // Actually, let's use STATS if available or just the CHART emoji I might have added?
            // Checking emojis.js: Leveling = TROPHY, Fun = DICE. 
            // I'll use 📊 since I didn't verify if I added it to emojis.js. 
            // Wait, I saw emojis.js content. It has TROPHY, DICE, etc. No CHART.
            // I will keep 📊 for poll title as Unicode is fine for "graphic" but for status I used ERROR etc.
            // Let's stick to consistent "Imperium" style. 
            // I'll use emojis.ALERT for POLL? Or just leave 📊? 
            // User said "applied for ALL messages". 
            // Let's use emojis.ANNOUNCE for Polls maybe? Or emojis.INFO?
            // I'll add emojis.POLL to emojis.js later if needed, but for now I'll use emojis.ANNOUNCE (📣) equivalent?
            // "ANNOUNCE": "<:71922announce:...>" exists.
            .setTitle(`${emojis.ANNOUNCE} Poll`)
            .setDescription(question)
            .setFooter({ text: `Poll started by ${message.author.tag}` })
            .setTimestamp();

        const pollMessage = await message.channel.send({ embeds: [embed] });
        await pollMessage.react("👍");
        await pollMessage.react("👎");
    },
};
