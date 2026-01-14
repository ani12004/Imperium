import { Events, EmbedBuilder } from "discord.js";
import { getGuildConfig } from "../utils/database.js";
import { snipeCache } from "../prefixCommands/utility/snipe.js";

export default {
    name: Events.MessageDelete,
    async execute(message, client) {
        if (message.partial || message.author?.bot || !message.guild) return;

        // --- SNIPE SYSTEM ---
        snipeCache.set(message.channel.id, {
            content: message.content,
            author: message.author,
            image: message.attachments.first()?.url || null,
            timestamp: new Date()
        });

        // --- LOGGING ---
        const config = await getGuildConfig(message.guild.id);
        if (config.mod_log_channel) {
            const logChannel = message.guild.channels.cache.get(config.mod_log_channel);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle("🗑️ Message Deleted")
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                    .setDescription(`**Content:** ${message.content || "None"}\n**Channel:** ${message.channel}`)
                    .setColor("Red")
                    .setTimestamp();

                if (message.attachments.first()) {
                    embed.addFields({ name: "Attachment", value: "[Link](" + message.attachments.first().url + ")" });
                }

                logChannel.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};
