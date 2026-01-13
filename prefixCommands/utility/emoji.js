import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "emoji",
    description: "Manage emojis.",
    permissions: [PermissionsBitField.Flags.ManageEmojisAndStickers],
    aliases: ["emote"],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (!action) return message.reply("Usage: ,emoji [add/remove/rename/stats/info]");

        switch (action) {
            case "add":
                // ,emoji add [url] [name] OR reply to image
                const url = args[1] || message.attachments.first()?.url;
                const name = args[2] || "custom_emoji";
                if (!url) return message.reply("Provide an image URL or attachment.");

                try {
                    const emoji = await message.guild.emojis.create({ attachment: url, name: name });
                    return message.reply(`✅ Added emoji ${emoji}`);
                } catch (e) {
                    return message.reply("Failed to add emoji (File too big? No slots?).");
                }

            case "remove":
                return message.reply("✅ Emoji removed (Mock).");

            case "rename":
                return message.reply("✅ Emoji renamed (Mock).");

            default:
                return message.reply("Unknown emoji action.");
        }
    }
};
