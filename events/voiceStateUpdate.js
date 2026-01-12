import { ChannelType, PermissionsBitField } from "discord.js";
import { getGuildConfig } from "../utils/database.js";

export default {
    name: "voiceStateUpdate",
    async execute(client, oldState, newState) {
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
                    console.error("Failed to delete temp voice channel:", e);
                }
            }
        }
    },
};
