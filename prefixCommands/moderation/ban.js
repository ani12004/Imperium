import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
  name: "ban",
  description: "Bans a user from the server.",
  permissions: [PermissionsBitField.Flags.BanMembers],
  botPermissions: [PermissionsBitField.Flags.BanMembers],
  aliases: ["banish"],
  async execute(message, args) {
    const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    const reason = args.slice(1).join(" ") || "No reason provided";

    if (!target) return message.reply(`${emojis.ERROR} Please mention a user or provide a valid ID.`);
    if (!target.bannable) return message.reply(`${emojis.ERROR} I cannot ban this user. They might have higher roles than me.`);

    await target.ban({ reason });

    const embed = new EmbedBuilder()
      .setColor("#FFB6C1")
      .setTitle(`${emojis.BAN} User Banned`)
      .setDescription(`**${target.user.tag}** has been banned.`)
      .addFields({ name: "Reason", value: reason })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
