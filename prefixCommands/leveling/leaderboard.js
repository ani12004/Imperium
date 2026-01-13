import { EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export default {
    name: "leaderboard",
    description: "Check the server leaderboard.",
    permissions: [],
    aliases: ["lb", "top"],
    async execute(message, args) {
        const { data: topUsers } = await db
            .from('users')
            .select('*')
            .eq('guild_id', message.guild.id)
            .order('xp', { ascending: false })
            .limit(10);

        if (topUsers.length === 0) return message.reply("❌ No data found.");

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle(`🏆 ${message.guild.name} Leaderboard`)
            .setDescription(
                topUsers.map((u, i) => {
                    return `**${i + 1}.** <@${u.user_id}> - Level ${u.level} (${u.xp} XP)`;
                }).join("\n")
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
