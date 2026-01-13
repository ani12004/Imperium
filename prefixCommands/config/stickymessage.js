import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

// Mock DB
const stickyMessages = new Map(); // ChannelID -> Content

export default {
    name: "stickymessage",
    description: "Manage sticky messages.",
    permissions: [PermissionsBitField.Flags.ManageMessages],
    aliases: ["sticky", "sm"],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (!action) return message.reply("Usage: ,stickymessage [add/remove/list/view]");

        switch (action) {
            case "add":
                // Usage: ,sticky add #channel message
                const channel = message.mentions.channels.first() || message.channel;
                const content = args.slice(2).join(" "); // Assuming #channel is mentioned
                // If no channel mention, maybe args[1] is start of content?
                // Let's assume strict usage for now or check args

                if (!content && !message.mentions.channels.first()) {
                    // Maybe usage is ,sticky add message (for current channel)
                    const localContent = args.slice(1).join(" ");
                    if (localContent) {
                        stickyMessages.set(message.channel.id, localContent);
                        return message.reply(`✅ Sticky message added to this channel.`);
                    }
                }

                if (content) {
                    stickyMessages.set(channel.id, content);
                    return message.reply(`✅ Sticky message set for ${channel}.`);
                }
                return message.reply("Usage: ,stickymessage add #channel [message] OR ,stickymessage add [message]");

            case "remove":
                const targetCh = message.mentions.channels.first() || message.channel;
                if (stickyMessages.has(targetCh.id)) {
                    stickyMessages.delete(targetCh.id);
                    return message.reply(`✅ Sticky message removed from ${targetCh}.`);
                }
                return message.reply("❌ No sticky message in that channel.");

            case "list":
                return message.reply(`📝 **Sticky Messages**: ${stickyMessages.size}`);

            case "view":
                const viewCh = message.mentions.channels.first() || message.channel;
                const msg = stickyMessages.get(viewCh.id);
                if (msg) return message.reply(`Sticky message in ${viewCh}: \n> ${msg}`);
                return message.reply("No sticky message set.");

            default:
                return message.reply("Unknown subcommand.");
        }
    }
};
