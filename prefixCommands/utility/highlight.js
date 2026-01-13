import { PermissionsBitField } from "discord.js";

const highlights = new Map(); // UserID -> words[]

export default {
    name: "highlight",
    description: "Get notified when words are spoken.",
    permissions: [],
    aliases: ["hl"],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (action === "add") {
            const word = args[1];
            // Logic to add word to highlights map
            return message.reply(`✅ Added **${word}** to your highlights.`);
        }
        if (action === "list") {
            return message.reply("📝 Your highlights: None");
        }
        return message.reply("Usage: ,highlight [add/remove/list]");
    }
};
