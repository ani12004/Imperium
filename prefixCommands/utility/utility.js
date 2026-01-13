import { EmbedBuilder } from "discord.js";

export default {
    name: "utility",
    description: "Misc utility commands.",
    permissions: [],
    aliases: ["urban", "weather", "hex", "define", "screenshot", "calc"],
    async execute(message, args) {
        const prefix = ",";
        const cmd = message.content.slice(prefix.length).split(/ +/)[0].toLowerCase();

        if (cmd === "hex") {
            return message.reply("#FF0000 (Mock Hex)");
        }
        if (cmd === "weather") {
            return message.reply("☀️ Sunny, 25°C (Mock Weather)");
        }
        if (cmd === "urban" || cmd === "define") {
            return message.reply("📖 **Definition**: A placeholder definition for demonstration.");
        }

        return message.reply("Utility command executed.");
    }
};
