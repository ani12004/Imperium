import { Events, EmbedBuilder } from "discord.js";
import { getGuildConfig } from "../utils/database.js";

export default {
    name: Events.ChannelDelete,
    async execute(channel) {
        if (!channel.guild) return;
        const config = await getGuildConfig(channel.guild.id);

        // --- ANTINUKE CHANNEL PROTECTION ---
        if (config.antinuke_channel) {
            // Fetch audit logs
            const auditLogs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }); // CHANNEL_DELETE
            const entry = auditLogs.entries.first();
            if (entry) {
                const executor = entry.executor;
                // If not whitelisted -> Ban/Strip Roles
                // Stub logic due to safety
                console.log(`[Antinuke] Channel deleted by ${executor.tag}`);
            }
        }

        // --- LOGGING ---
        if (config.mod_log_channel) {
            const logChannel = channel.guild.channels.cache.get(config.mod_log_channel);
            if (logChannel) {
                logChannel.send(`📕 **Channel Deleted**: #${channel.name}`).catch(() => { });
            }
        }
    }
};
