import { EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "leaderboard",
    description: "Shows the richest users.",
    aliases: ["lb", "top"],
    async execute(message, args) {
        const { data: topUsers } = await db
            .from('users')
            .select('user_id, balance')
            .eq('guild_id', message.guild.id)
            .order('balance', { ascending: false })
            .limit(10);

        if (!topUsers.length) return message.reply("No data found.");

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle(`${emojis.TROPHY} ${message.guild.name} Leaderboard`)
            .setTimestamp();

        let description = "";
        for (const [index, data] of topUsers.entries()) {
            // Fetch user to get tag, might be slow if many, but for 10 it's ok-ish or just use ID
            // Ideally we cache or just show ID if not in cache, but let's try to get username
            const user = await message.guild.members.fetch(data.user_id).catch(() => null);
            const name = user ? user.user.username : "Unknown User";
            description += `**${index + 1}.** ${name} - **${emojis.COIN}${data.balance}**\n`;
        }

        embed.setDescription(description);
        message.channel.send({ embeds: [embed] });
    },
};
