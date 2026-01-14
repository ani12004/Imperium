import { Events, EmbedBuilder } from "discord.js";
import { getGuildConfig } from "../utils/database.js";

export default {
    name: Events.GuildRoleDelete,
    async execute(role) {
        const config = await getGuildConfig(role.guild.id);

        // --- ANTINUKE ROLE PROTECTION ---
        if (config.antinuke_role) {
            const auditLogs = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }); // ROLE_DELETE
            const entry = auditLogs.entries.first();
            if (entry) {
                // Punishment logic
            }
        }

        // --- LOGGING ---
        if (config.mod_log_channel) {
            const logChannel = role.guild.channels.cache.get(config.mod_log_channel);
            if (logChannel) {
                logChannel.send(`🛡️ **Role Deleted**: ${role.name}`).catch(() => { });
            }
        }
    }
};
