import { EmbedBuilder } from "discord.js";
import db, { updateUser } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "afk",
    description: "Set your AFK status.",
    aliases: [],
    usage: "<reason>",
    permissions: [],
    botPermissions: [],
    category: "utility",

    async execute(message, args, client) {
        const reason = args.join(" ") || "AFK";
        const userId = message.author.id;
        const guildId = message.guild.id;

        try {
            // Upsert AFK status
            const { error } = await db
                .from('afk')
                .upsert({
                    user_id: userId,
                    guild_id: guildId,
                    reason: reason,
                    timestamp: Date.now()
                }, { onConflict: 'user_id' });

            if (error) throw error;

            const embed = new EmbedBuilder()
                .setColor("#6EE7B7") // Mint (Success)
                .setTitle("Is now AFK")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setDescription(`> ${reason}`)
                .setFooter({ text: 'Imperium • Status updated' });

            message.channel.send({ embeds: [embed] });

            // Update user nickname if permissions allow
            if (message.member.manageable && message.guild.members.me.permissions.has("ManageNicknames")) {
                const oldNick = message.member.nickname || message.author.username;
                if (!oldNick.startsWith("[AFK]")) {
                    const newNick = `[AFK] ${oldNick}`.substring(0, 32); // Discord limit
                    await message.member.setNickname(newNick).catch(e => console.error(`Failed to set AFK nick for ${message.author.tag}: ${e.message}`));
                }
            }

        } catch (error) {
            console.error("AFK Error:", error);
            message.channel.send(`${emojis.ERROR} Failed to set AFK status.`);
        }
    }
};
