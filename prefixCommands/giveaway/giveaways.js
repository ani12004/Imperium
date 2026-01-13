import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

// Mock store for active giveaways (use DB in production)
const activeGiveaways = new Map();

export default {
    name: "giveaways",
    description: "Manage giveaways.",
    permissions: [PermissionsBitField.Flags.ManageGuild],
    aliases: ["g", "giveaway"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.reply(`❌ Usage: ,giveaways [list/end/reroll/cancel] ...`);
        }

        switch (subcommand) {
            case "list":
                return message.reply(`${emojis.GIVEAWAY || '🎉'} **Active Giveaways**: ${activeGiveaways.size > 0 ? activeGiveaways.size : "None"}`);

            case "end":
                const endMsgId = args[1];
                if (!endMsgId) return message.reply("Usage: ,giveaways end [messageID]");
                // Real logic: find giveaway in DB, call end() method
                return message.reply(`${emojis.SUCCESS || '✅'} Ended giveaway with ID: ${endMsgId}`);

            case "reroll":
                const rerollMsgId = args[1];
                if (!rerollMsgId) return message.reply("Usage: ,giveaways reroll [messageID]");
                // Real logic: find, pick new winner
                return message.reply(`${emojis.SUCCESS || '✅'} Rerolled winner for giveaway: ${rerollMsgId}`);

            case "cancel":
                const cancelMsgId = args[1];
                if (!cancelMsgId) return message.reply("Usage: ,giveaways cancel [messageID]");
                // Real logic: delete from DB, edit message
                return message.reply(`${emojis.SUCCESS || '✅'} Cancelled giveaway: ${cancelMsgId}`);

            default:
                return message.reply("Unknown subcommand. Use: list, end, reroll, cancel");
        }
    },
};
