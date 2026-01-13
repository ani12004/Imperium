import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";


// Actually, let's write a simple parser to avoid dependency if possible, or just install ms. 
// I'll use a simple regex for now to keep it dependency-free if I can, but ms is standard.
// Let's assume I can install ms. I'll add it to the install list or use a helper.
// For now, I'll use a simple helper function inside.

function parseDuration(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2];
  if (unit === 's') return val * 1000;
  if (unit === 'm') return val * 60 * 1000;
  if (unit === 'h') return val * 60 * 60 * 1000;
  if (unit === 'd') return val * 24 * 60 * 60 * 1000;
  return null;
}

export default {
  name: "timeout",
  description: "Timeouts a user.",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  botPermissions: [PermissionsBitField.Flags.ModerateMembers],
  aliases: ["mute"],
  async execute(message, args) {
    const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    const durationStr = args[1];
    const reason = args.slice(2).join(" ") || "No reason provided";

    if (!target) return message.reply(`${emojis.ERROR} Please mention a user.`);
    if (!durationStr) return message.reply(`${emojis.ERROR} Please provide a duration (e.g., 1m, 1h).`);

    const duration = parseDuration(durationStr);
    if (!duration) return message.reply(`${emojis.ERROR} Invalid duration format. Use 1s, 1m, 1h, 1d.`);

    if (!target.moderatable) return message.reply(`${emojis.ERROR} I cannot timeout this user.`);

    await target.timeout(duration, reason);

    const embed = new EmbedBuilder()
      .setColor("#FFB6C1")
      .setTitle(`${emojis.MUTE} User Muted`)
      .setDescription(`**${target.user.tag}** has been timed out for **${durationStr}**.`)
      .addFields({ name: "Reason", value: reason })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
