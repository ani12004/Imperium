import { PermissionsBitField, EmbedBuilder } from "discord.js";

export default {
    name: "info",
    description: "Information commands.",
    permissions: [],
    aliases: ["userinfo", "serverinfo", "avatar", "banner", "splash", "roles", "emotes", "bots", "members", "whois", "ui", "si"],
    async execute(message, args) {
        // Detect alias used
        const prefix = ",";
        const cmd = message.content.slice(prefix.length).split(/ +/)[0].toLowerCase();

        const target = message.mentions.members.first() || message.member;

        if (["avatar", "av"].includes(cmd)) {
            return message.reply(target.displayAvatarURL({ size: 1024 }));
        }
        if (["banner"].includes(cmd)) {
            // Fetch user to get banner (force)
            const user = await message.client.users.fetch(target.id, { force: true });
            return message.reply(user.bannerURL({ size: 1024 }) || "No banner.");
        }
        if (["serverinfo", "si"].includes(cmd)) {
            const embed = new EmbedBuilder()
                .setTitle(message.guild.name)
                .addFields(
                    { name: "Owner", value: `<@${message.guild.ownerId}>`, inline: true },
                    { name: "Members", value: `${message.guild.memberCount}`, inline: true }
                );
            return message.reply({ embeds: [embed] });
        }
        if (["userinfo", "ui", "whois"].includes(cmd)) {
            const embed = new EmbedBuilder()
                .setTitle(target.user.tag)
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: "ID", value: target.id, inline: true },
                    { name: "Created", value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>`, inline: true }
                );
            return message.reply({ embeds: [embed] });
        }

        return message.reply("Command detected but logic placeholder.");
    }
};
