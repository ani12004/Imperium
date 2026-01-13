import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { addWarning } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "warn",
    description: "Warns a user.",
    permissions: [PermissionsBitField.Flags.ManageMessages],
    botPermissions: [PermissionsBitField.Flags.ManageMessages],
    aliases: ["w"],
    async execute(message, args) {
        const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        const reason = args.slice(1).join(" ") || "No reason provided";

        if (!target) return message.reply(`${emojis.ERROR} Please mention a user or provide a valid ID.`);
        if (target.id === message.author.id) return message.reply(`${emojis.ERROR} You cannot warn yourself.`);
        if (target.roles.highest.position >= message.member.roles.highest.position) return message.reply(`${emojis.ERROR} You cannot warn this user.`);

        addWarning(message.guild.id, target.id, reason);

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle(`${emojis.WARN} User Warned`)
            .setDescription(`**${target.user.tag}** has been warned.`)
            .addFields({ name: "Reason", value: reason })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });

        // DM the user
        try {
            await target.send(`You have been warned in **${message.guild.name}** for: ${reason}`);
        } catch (e) {
            // Ignore if DMs are closed
        }
    },
};
