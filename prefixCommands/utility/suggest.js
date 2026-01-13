import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

// Mock Config
let suggestionChannelId = null;

export default {
    name: "suggest",
    description: "Submit or manage suggestions.",
    permissions: [],
    aliases: ["suggestion"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        // If user just types ,suggest [text], it's a submission
        if (!subcommand || !["set", "accept", "deny"].includes(subcommand)) {
            const suggestion = args.join(" ");
            if (!suggestion) return message.reply("Usage: ,suggest [your suggestion]");

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTitle("New Suggestion")
                .setDescription(suggestion)
                .setTimestamp();

            // If channel set, send there. Else send here.
            const targetChannel = suggestionChannelId ? message.guild.channels.cache.get(suggestionChannelId) : message.channel;

            if (!targetChannel) return message.reply("Suggestion channel not found.");

            const msg = await targetChannel.send({ embeds: [embed] });
            await msg.react('👍');
            await msg.react('👎');

            if (targetChannel.id !== message.channel.id) {
                return message.reply(`${emojis.SUCCESS || '✅'} Suggestion submitted!`);
            }
            return;
        }

        // Management subcommands
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply("You need Manage Guild permissions.");
        }

        switch (subcommand) {
            case "set":
                const channel = message.mentions.channels.first();
                if (!channel) return message.reply("Usage: ,suggest set #channel");
                suggestionChannelId = channel.id; // In real bot, save to DB
                return message.reply(`${emojis.SUCCESS || '✅'} Suggestions channel set to ${channel}.`);

            case "accept":
                return message.reply(`${emojis.SUCCESS || '✅'} Suggestion accepted (Mock - would edit embed).`);

            case "deny":
                return message.reply(`${emojis.SUCCESS || '✅'} Suggestion denied (Mock).`);
        }
    },
};
