import { EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export default {
    name: "levels",
    description: "Shows the top ranked users.",
    aliases: ["xpboard"],
    async execute(message, args) {
        const { data: topUsers } = await db
            .from('users')
            .select('user_id, level, xp')
            .eq('guild_id', message.guild.id)
            .order('xp', { ascending: false })
            .limit(10);

        if (!topUsers.length) return message.reply("No data found.");

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`📊 ${message.guild.name} Level Leaderboard`)
            .setTimestamp();

        let description = "";
        for (const [index, data] of topUsers.entries()) {
            const user = await message.guild.members.fetch(data.user_id).catch(() => null);
            const name = user ? user.user.username : "Unknown User";
            description += `**${index + 1}.** ${name} - Level ${data.level} (${data.xp} XP)\n`;
        }

        embed.setDescription(description);
        message.channel.send({ embeds: [embed] });
    },
};
