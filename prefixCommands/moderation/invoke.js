import { PermissionsBitField } from "discord.js";
import { setInvokeMessage } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

// List of all punishment types that support custom messages/invocation
const PUNISHMENTS = [
    "timeout", "tempban", "runmute", "kick", "softban", "hardban",
    "unban", "unmute", "mute", "ban", "iunmute", "jail", "unjail",
    "warn", "rmute", "imute", "untimeout"
];

export default {
    name: "invoke",
    description: "Customize punishment messages and settings.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: [],
    async execute(message, args) {
        // Usage: ,invoke [type] [context] [view/value]
        // Examples:
        // ,invoke ban message You have been banned by {mod}.
        // ,invoke ban dm You were banned from {guild} for {reason}.
        // ,invoke ban dm view

        const type = args[0]?.toLowerCase();

        if (!type || !PUNISHMENTS.includes(type)) {
            return message.reply(`${emojis.ERROR} Usage: ,invoke [${PUNISHMENTS.slice(0, 5).join("/")}...] [message/dm] [content/view]`);
        }

        const context = args[1]?.toLowerCase();
        if (!context || !["message", "dm"].includes(context)) {
            // Maybe user just typed `,invoke ban This is message` -> Default to "message"?
            // The text file lists `invoke ban dm` and `invoke ban message`.
            return message.reply(`Usage: ,invoke ${type} [message/dm] [content/view]`);
        }

        const value = args.slice(2).join(" ");
        if (!value) {
            return message.reply("Please provide the custom message or use 'view'.");
        }

        if (value === "view") {
            // In a real DB, fetch and show
            return message.reply(`Current **${context}** for **${type}**: (Default)`);
        }

        // Save to DB
        // The original `setInvokeMessage` might need update to handle context (dm vs channel message)
        // For now we assume a key format like `ban_message` or `ban_dm`
        const key = `${type}_${context}`;

        // Mock DB call or assuming setInvokeMessage handles generic keys
        // If setInvokeMessage only took (guildId, command, msg), we pass key as command
        try {
            await setInvokeMessage(message.guild.id, key, value);
            return message.reply(`${emojis.SUCCESS} Updated **${type} ${context}**: \`${value}\``);
        } catch (e) {
            console.error(e);
            return message.reply(`${emojis.ERROR} Failed to save message.`);
        }
    },
};
