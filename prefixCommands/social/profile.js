import { EmbedBuilder } from "discord.js";
import { getEconomy } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "profile",
    description: "View your social profile.",
    aliases: ["p", "userinfo"],
    async execute(message, args, client) {
        const target = message.mentions.users.first() || message.author;
        const user = getEconomy(target.id);

        let partnerName = "None";
        if (user.partner_id) {
            const partner = await client.users.fetch(user.partner_id).catch(() => null);
            partnerName = partner ? partner.username : "Unknown";
        }

        let parentName = "None";
        if (user.parent_id) {
            const parent = await client.users.fetch(user.parent_id).catch(() => null);
            parentName = parent ? parent.username : "Unknown";
        }

        const children = JSON.parse(user.children || '[]');
        const childrenCount = children.length;

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`${target.username}'s Profile`)
            .setThumbnail(target.displayAvatarURL())
            .setDescription(`**Bio:**\n${user.bio || "No bio set. Use `s?setbio` to set one."}`)
            .addFields(
                { name: `${emojis.WALLET} Balance`, value: `$${user.balance}`, inline: true },
                { name: `${emojis.BANK} Bank`, value: `$${user.bank}`, inline: true },
                { name: `${emojis.HEART} Partner`, value: partnerName, inline: true },
                { name: `${emojis.USERS} Parent`, value: parentName, inline: true },
                { name: `${emojis.USERS} Children`, value: `${childrenCount}`, inline: true }
            );

        if (user.marriage_time) {
            const date = new Date(user.marriage_time).toLocaleDateString();
            embed.setFooter({ text: `Married since: ${date}` });
        }

        message.channel.send({ embeds: [embed] });
    },
};
