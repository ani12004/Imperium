import { PermissionsBitField } from "discord.js";

const reminders = new Set();

export default {
    name: "remind",
    description: "Set a reminder.",
    permissions: [],
    aliases: ["reminder"],
    async execute(message, args) {
        const timeStr = args[0];
        const reason = args.slice(1).join(" ") || "No reason";

        if (!timeStr) return message.reply("Usage: ,remind [seconds/minutes] [reason] (e.g. ,remind 60s check server)");

        // Simple parser
        let time = parseInt(timeStr);
        if (timeStr.endsWith("m")) time *= 60;
        else if (timeStr.endsWith("h")) time *= 3600;

        if (isNaN(time)) return message.reply("Invalid time.");

        message.reply(`✅ I will remind you in **${timeStr}**: ${reason}`);

        setTimeout(async () => {
            try {
                await message.reply(`⏰ **REMINDER**: ${message.author}, you asked me to remind you: ${reason}`);
            } catch (e) {
                // Channel maybe deleted
            }
        }, time * 1000);
    }
};
