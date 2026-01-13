import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

// Mock database for ignored channels (In a real app, use a DB table)
const ignoredChannels = new Set();
const defaultLockRole = new Map(); // GuildID -> RoleID

export default {
    name: "lockdown",
    description: "Lockdown channels to prevent chatting.",
    permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild],
    aliases: ["lockall"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            // Default: Lockdown current channel? Or usage? 
            // The command list has `lockdown` separate from `lockdown all`.
            // Usually `lockdown` locks the current channel, but `lock` command already exists.
            // Let's assume `lockdown` locks the *current* channel similar to `lock` but maybe stricter? 
            // Or maybe it triggers a server-wide lockdown? 
            // Based on list: `lockdown` -> Lockdown a channel. `lockdown all` -> Locks all channels.

            // Let's treat plain `lockdown` as locking the current channel (alias to lock basically)
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false,
            });
            return message.reply(`${emojis.LOCK || '🔒'} Channel locked.`);
        }

        switch (subcommand) {
            case "all":
                if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
                    return message.reply("Admin permission required for server lockdown.");

                const channels = message.guild.channels.cache.filter(c =>
                    c.isTextBased() &&
                    !ignoredChannels.has(c.id) &&
                    c.manageable
                );

                message.reply(`${emojis.LOADING || '⏳'} Locking down ${channels.size} channels...`);

                let count = 0;
                for (const [id, channel] of channels) {
                    try {
                        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                            SendMessages: false
                        });
                        count++;
                    } catch (e) {
                        console.error(`Failed to lock ${channel.name}:`, e);
                    }
                }
                return message.channel.send(`${emojis.SUCCESS || '✅'} Server lockdown complete. Locked **${count}** channels.`);

            case "ignore":
                const action = args[1]?.toLowerCase();
                const targetChannel = message.mentions.channels.first() || message.channel;

                if (action === "add") {
                    ignoredChannels.add(targetChannel.id);
                    return message.reply(`✅ ${targetChannel} will be ignored during lockdown.`);
                } else if (action === "remove") {
                    ignoredChannels.delete(targetChannel.id);
                    return message.reply(`✅ ${targetChannel} will NO LONGER be ignored during lockdown.`);
                } else if (action === "list") {
                    // In a real bot, fetch from DB
                    return message.reply(`ignored channels in memory: ${ignoredChannels.size}`);
                }
                return message.reply("Usage: ,lockdown ignore [add/remove/list] #channel");

            case "role":
                const role = message.mentions.roles.first();
                if (!role) return message.reply("Usage: ,lockdown role @role");
                defaultLockRole.set(message.guild.id, role.id);
                return message.reply(`✅ Lockdown role set to **${role.name}**.`);

            default:
                return message.reply("Usage: ,lockdown [all/ignore/role]");
        }
    }
};
