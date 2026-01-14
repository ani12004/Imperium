import { Events, EmbedBuilder } from "discord.js";
import { getGuildConfig } from "../utils/database.js";

export default {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const config = await getGuildConfig(member.guild.id);

        // --- ANTINUKE KICK PROTECTION ---
        // (Stub: Check audit logs to see who kicked. If rate > limit -> Remove roles/Ban executor)

        // --- LOGGING ---
        if (config.mod_log_channel) {
            const logChannel = member.guild.channels.cache.get(config.mod_log_channel);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle("📤 Member Left")
                    .setDescription(`**${member.user.tag}** has left the server.`)
                    .setColor("Orange")
                    .setTimestamp();
                logChannel.send({ embeds: [embed] }).catch(() => { });
            }
        }

        // --- GOODBYE MESSAGE ---
        if (config.goodbye_channel) {
            const channel = member.guild.channels.cache.get(config.goodbye_channel);
            if (channel) {
                const msg = config.goodbye_message
                    ? config.goodbye_message.replace('{member}', member.user.username).replace('{server}', member.guild.name)
                    : `Goodbye ${member.user.username}!`;
                channel.send(msg).catch(() => { });
            }
        }
    }
};
