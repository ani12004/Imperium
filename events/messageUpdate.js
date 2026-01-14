import { Events, EmbedBuilder } from "discord.js";
import { getGuildConfig } from "../utils/database.js";
import { editSnipeCache } from "../prefixCommands/utility/snipe.js";

export default {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.partial || oldMessage.author?.bot || !oldMessage.guild) return;
        if (oldMessage.content === newMessage.content) return; // Embed update or similar

        // --- EDIT SNIPE ---
        editSnipeCache.set(oldMessage.channel.id, {
            content: oldMessage.content,
            author: oldMessage.author,
            timestamp: new Date()
        });

        // --- LOGGING ---
        const config = await getGuildConfig(newMessage.guild.id);
        if (config.mod_log_channel) {
            const logChannel = newMessage.guild.channels.cache.get(config.mod_log_channel);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle("✏️ Message Edited")
                    .setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL() })
                    .addFields(
                        { name: "Before", value: oldMessage.content?.substring(0, 1024) || "None" },
                        { name: "After", value: newMessage.content?.substring(0, 1024) || "None" },
                        { name: "Channel", value: `${newMessage.channel}` }
                    )
                    .setColor("Yellow")
                    .setTimestamp();

                logChannel.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};
