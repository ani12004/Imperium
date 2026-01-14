import { Events, EmbedBuilder } from "discord.js";
import { getGuildConfig } from "../utils/database.js";

export default {
    name: Events.GuildBanAdd,
    async execute(ban) {
        const config = await getGuildConfig(ban.guild.id);

        // --- ANTINUKE BAN PROTECTION ---
        // (Stub: Check ban rate. If excessive -> Punish executor)

        // --- LOGGING ---
        if (config.mod_log_channel) {
            const logChannel = ban.guild.channels.cache.get(config.mod_log_channel);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle("🔨 Member Banned")
                    .setDescription(`**${ban.user.tag}** was banned.`)
                    .setColor("Red")
                    .setTimestamp();
                logChannel.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};
