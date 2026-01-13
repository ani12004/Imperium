import { EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "leaderboard",
    description: "Shows the richest users.",
    aliases: ["lb", "top"],
    async execute(message, args) {
        // Economy is Global, so we query the economy table directly
        const { data: topUsers } = await db
            .from('economy')
            .select('user_id, balance')
            .order('balance', { ascending: false })
            .limit(10);

        if (!topUsers || topUsers.length === 0) return message.reply("No data found.");

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle(`${emojis.TROPHY} Global Economy Leaderboard`)
            .setTimestamp();

        let description = "";
        for (const [index, data] of topUsers.entries()) {
            const user = await message.client.users.fetch(data.user_id).catch(() => null);
            const name = user ? user.username : "Unknown User";
            description += `**${index + 1}.** ${name} - **${emojis.COIN}${data.balance}**\n`;
        }

        embed.setDescription(description);
        message.channel.send({ embeds: [embed] });
    },
};
