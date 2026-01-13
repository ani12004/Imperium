import { PermissionsBitField, EmbedBuilder } from "discord.js";

export default {
    name: "embed",
    description: "Create or manage embeds.",
    permissions: [PermissionsBitField.Flags.ManageMessages],
    aliases: [],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (action === "create") {
            return message.reply("✅ Embed builder started (Mock Interactive Session).");
        }

        // Simple usage: ,embed [json] or ,embed [content]
        try {
            const json = JSON.parse(args.join(" "));
            return message.channel.send({ embeds: [json] });
        } catch (e) {
            return message.reply("Usage: ,embed create OR ,embed [valid_json]");
        }
    }
};
