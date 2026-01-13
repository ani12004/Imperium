import { PermissionsBitField } from "discord.js";

export default {
    name: "sticker",
    description: "Manage stickers.",
    permissions: [PermissionsBitField.Flags.ManageEmojisAndStickers],
    aliases: [],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();
        if (action === "add") {
            const url = args[1];
            const name = args[2] || "sticker";
            const tags = args[3] || "sticker";
            if (!url) return message.reply("Usage: ,sticker add [url] [name] [tags]");

            try {
                const sticker = await message.guild.stickers.create({ file: url, name: name, tags: tags });
                return message.reply(`✅ Created sticker **${sticker.name}**.`);
            } catch (e) {
                return message.reply("Failed to create sticker.");
            }
        }
        return message.reply("Usage: ,sticker [add/remove/rename]");
    }
};
