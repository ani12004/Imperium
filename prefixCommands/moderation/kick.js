import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
  name: "kick",
  description: "Kicks a user from the server.",
  permissions: [PermissionsBitField.Flags.KickMembers],
  botPermissions: [PermissionsBitField.Flags.KickMembers],
  aliases: [],
  async execute(message, args) {
    const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    const reason = args.slice(1).join(" ") || "No reason provided";

    if (!target) return message.reply(`${emojis.ERROR} Please mention a user or provide a valid ID.`);
    if (!target.kickable) return message.reply(`${emojis.ERROR} I cannot kick this user.`);

    await target.kick(reason);

    const embed = new EmbedBuilder()
      .setColor("#F59E0B")
      .setTitle(`${emojis.KICK} User Kicked`)
      .setDescription(`> **User:** ${target.user.tag}\n> **ID:** ${target.id}`)
      .addFields({ name: "Reason", value: reason })
      .setFooter({ text: `Action by ${message.author.username}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
