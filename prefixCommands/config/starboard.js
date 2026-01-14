import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { setGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "starboard",
    description: "Showcase the best messages in your server.",
    permissions: [PermissionsBitField.Flags.ManageGuild],
    aliases: ["sb"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.reply(`${emojis.ERROR} Usage: ,starboard [set/off/emoji/threshold/color...]`);
        }

        switch (subcommand) {
            case "set":
                const channel = message.mentions.channels.first() || message.channel;
                await setGuildConfig(message.guild.id, "starboard_channel", channel.id);
                return message.reply(`${emojis.SUCCESS} Starboard channel set to ${channel}.`);

            case "lock":
            case "off":
                await setGuildConfig(message.guild.id, "starboard_enabled", false);
                return message.reply(`${emojis.SUCCESS} Starboard disabled.`);

            case "unlock":
            case "on":
                await setGuildConfig(message.guild.id, "starboard_enabled", true);
                return message.reply(`${emojis.SUCCESS} Starboard enabled.`);

            case "emoji":
                const emoji = args[1];
                if (!emoji) return message.reply("Please provide an emoji.");
                await setGuildConfig(message.guild.id, "starboard_emoji", emoji);
                return message.reply(`${emojis.SUCCESS} Starboard emoji set to ${emoji}.`);

            case "threshold":
            case "limit":
                const num = parseInt(args[1]);
                if (isNaN(num) || num < 1) return message.reply("Invalid number.");
                await setGuildConfig(message.guild.id, "starboard_threshold", num);
                return message.reply(`${emojis.SUCCESS} Threshold set to **${num}**.`);

            case "color":
                const color = args[1];
                if (!color) return message.reply("Usage: #hex");
                await setGuildConfig(message.guild.id, "starboard_color", color);
                return message.reply(`${emojis.SUCCESS} Color updated.`);

            case "selfstar":
                return message.reply(`${emojis.SUCCESS} Self-starring toggle updated (Stub).`);

            case "ignore":
                return message.reply(`${emojis.SUCCESS} Updated ignore list (Stub).`);

            case "reset":
                await setGuildConfig(message.guild.id, "starboard_channel", null);
                await setGuildConfig(message.guild.id, "starboard_enabled", false);
                return message.reply(`${emojis.SUCCESS} Starboard configuration reset.`);

            case "config":
                const embed = new EmbedBuilder()
                    .setTitle("⭐ Starboard Settings")
                    .setDescription(`Channel: ${config.starboard_channel ? `<#${config.starboard_channel}>` : "Not Set"}
Emoji: ${config.starboard_emoji || emojis.STAR}
Threshold: ${config.starboard_threshold || 3}
Enabled: ${config.starboard_enabled ? "True" : "False"}`)
                    .setColor("#FFD700");
                return message.channel.send({ embeds: [embed] });

            default:
                return message.reply("Unknown subcommand.");
        }
    }
};
