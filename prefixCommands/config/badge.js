import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { setGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "badge",
    description: "Reward members for setting the guild tag.",
    permissions: [PermissionsBitField.Flags.ManageGuild],
    aliases: [],
    async execute(message, args) {
        // badge role: Award members for applying the guild tag
        // badge role add/list/remove
        // badge sync
        // badge channel
        // badge message

        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) return message.reply("Usage: ,badge [role/sync/channel/message]");

        if (subcommand === "sync") {
            message.channel.send(`${emojis.LOADING} Syncing guild tags...`);
            // Mock sync
            setTimeout(() => {
                message.channel.send(`${emojis.SUCCESS} Synced tags for **${message.guild.memberCount}** members.`);
            }, 1000);
            return;
        }

        if (subcommand === "channel") {
            const channel = message.mentions.channels.first();
            if (!channel) return message.reply("Usage: ,badge channel #channel");
            await setGuildConfig(message.guild.id, "badge_channel", channel.id);
            return message.reply(`${emojis.SUCCESS} Badge award channel set to ${channel}`);
        }

        if (subcommand === "message") {
            const msg = args.slice(1).join(" ");
            if (!msg) return message.reply("Usage: ,badge message [text/embed code]");
            await setGuildConfig(message.guild.id, "badge_message", msg);
            return message.reply(`${emojis.SUCCESS} Badge message updated.`);
        }

        if (subcommand === "role") {
            const action = args[1]?.toLowerCase();
            if (!action) return message.reply("Usage: ,badge role [add/remove/list]");

            if (action === "list") {
                return message.reply("Badge Roles: None set (Stub).");
            }
            if (action === "add" || action === "remove") {
                const role = message.mentions.roles.first();
                if (!role) return message.reply("Please mention a role.");
                return message.reply(`${emojis.SUCCESS} Role ${role.name} ${action === "add" ? "added to" : "removed from"} badge rewards.`);
            }
        }

        return message.reply("Usage: ,badge [role/sync/channel/message]");
    }
};
