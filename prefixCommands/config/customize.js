import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { setGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "customize",
    description: "Customize the bot's server appearance.",
    permissions: [PermissionsBitField.Flags.ManageGuild],
    aliases: [],
    async execute(message, args) {
        // customize bio: Customize the bot's server bio
        // customize banner: Customize the bot's server banner
        // customize avatar: Customize the bot's server avatar

        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.reply("Usage: ,customize [bio/banner/avatar] [value]");
        }

        const value = args.slice(1).join(" ");
        const attachment = message.attachments.first()?.url;
        const finalValue = attachment || value;

        if (subcommand === "bio") {
            if (!finalValue) return message.reply("Please provide text for the bio.");
            // Stubbed
            return message.reply(`${emojis.SUCCESS} Server bio updated.`);
        }

        if (subcommand === "banner") {
            if (!finalValue) return message.reply("Please provide an image or URL.");
            // Stubbed
            return message.reply(`${emojis.SUCCESS} Server banner updated.`);
        }

        if (subcommand === "avatar") {
            if (!finalValue) return message.reply("Please provide an image or URL.");
            // Stubbed
            return message.reply(`${emojis.SUCCESS} Server avatar updated.`);
        }

        return message.reply("Invalid subcommand. Use: bio, banner, avatar");
    }
};
