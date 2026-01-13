import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

// Mock DB
const triggers = new Map();

export default {
    name: "autoresponder",
    description: "Manage auto-replies.",
    permissions: [PermissionsBitField.Flags.ManageGuild],
    aliases: ["ar"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) return message.reply("Usage: ,autoresponder [add/remove/list]");

        switch (subcommand) {
            case "add":
                // Simple syntax: ,ar add [trigger] [reply]
                // Ideally needs "quotes" parsing or delimiter
                return message.reply(`${emojis.SUCCESS || '✅'} Auto-response added (Mock).`);
            case "remove":
                return message.reply(`${emojis.SUCCESS || '✅'} Auto-response removed (Mock).`);
            case "list":
                return message.reply(`${emojis.list || '📝'} **Auto Responders**: 0`);
            default:
                return message.reply("Unknown subcommand.");
        }
    },
};
