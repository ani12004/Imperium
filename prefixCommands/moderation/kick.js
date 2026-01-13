import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";
import { setLogChannel } from "../../utils/database.js"; // Re-using DB for storage if needed

export default {
  name: "kick",
  description: "Kicks a user OR manage Kick.com notifications.",
  permissions: [PermissionsBitField.Flags.KickMembers], // Base perm for moderation
  botPermissions: [PermissionsBitField.Flags.KickMembers],
  aliases: [],
  async execute(message, args) {
    // Check if subcommand is for Streaming (Kick.com)
    const subcommand = args[0]?.toLowerCase();
    const streamingSubcommands = ["add", "remove", "list", "message"];

    if (streamingSubcommands.includes(subcommand)) {
      // --- STREAMING LOGIC ---
      switch (subcommand) {
        case "add":
          // usage: ,kick add [streamer] [channel]
          return message.reply(`${emojis.SUCCESS || '✅'} Kick.com stream notifications enabled (Mock).`);
        case "remove":
          return message.reply(`${emojis.SUCCESS || '✅'} Kick.com stream notifications disabled (Mock).`);
        case "list":
          return message.reply("📝 Active Kick.com subscriptions: None (Mock)");
        case "message":
          return message.reply("✅ Notification message updated.");
      }
      return;
    }

    // --- MODERATION LOGIC ---
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
