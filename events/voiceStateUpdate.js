import { ChannelType, PermissionsBitField } from "discord.js";
import { getGuildConfig } from "../utils/database.js";

export default {
    name: "voiceStateUpdate",
    async execute(oldState, newState, client) {
        const guild = newState.guild;
        const config = await getGuildConfig(guild.id);

        if (!config.voicemaster_channel || !config.voicemaster_category) return;

        // Join to Create
        if (newState.channelId === config.voicemaster_channel) {
            try {
                const channel = await guild.channels.create({
                    name: `${newState.member.user.username}'s Channel`,
                    type: ChannelType.GuildVoice,
                    parent: config.voicemaster_category,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            allow: [PermissionsBitField.Flags.Connect]
                        },
                        {
                            id: newState.member.id,
                            allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.Connect]
                        }
                    ]
                });

                await newState.setChannel(channel);
            } catch (e) {
                console.error("Failed to create temp voice channel:", e);
            }
        }

        // Leave to Delete
        if (oldState.channelId && oldState.channel.parentId === config.voicemaster_category && oldState.channelId !== config.voicemaster_channel) {
            if (oldState.channel.members.size === 0) {
                try {
                    await oldState.channel.delete();
                } catch (e) {
                    // Ignore Unknown Channel error (already deleted)
                    if (e.code !== 10003) {
                        console.error("Failed to delete temp voice channel:", e);
                    }
                }
            }
        }
        // ... existing logic ...

        // --- LOGGING ---
        if (config.mod_log_channel) {
            const logChannel = guild.channels.cache.get(config.mod_log_channel);
            if (logChannel) {
                if (!oldState.channelId && newState.channelId) {
                    logChannel.send(`🎙️ **${newState.member.user.tag}** joined voice channel **${newState.channel.name}**`).catch(() => { });
                }
                if (oldState.channelId && !newState.channelId) {
                    logChannel.send(`🎙️ **${oldState.member.user.tag}** left voice channel **${oldState.channel.name}**`).catch(() => { });
                }
                if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                    logChannel.send(`🎙️ **${newState.member.user.tag}** moved to **${newState.channel.name}**`).catch(() => { });
                }
            }
        }
    },
};
