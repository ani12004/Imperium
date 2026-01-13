import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
  name: "purge",
  description: "Advanced deletion of messages.",
  permissions: [PermissionsBitField.Flags.ManageMessages],
  aliases: ["clear", "c"],
  async execute(message, args) {
    const amount = parseInt(args[0]);
    const filterType = args[1]?.toLowerCase(); // bots, images, links, etc. (optional)

    // Usage: ,purge 100 bots
    // Or just: ,purge bots 100 ? Usually amount is first.

    // If no amount is provided, maybe args[0] is the filter?
    if (isNaN(amount)) {
      return message.reply("Usage: ,purge [amount] [optional: filter]");
    }

    if (amount > 100 || amount < 1) return message.reply("Please provide an amount between 1 and 100.");

    if (!filterType) {
      // Simple purge
      await message.channel.bulkDelete(amount, true).catch(() => null);
      return message.channel.send(`${emojis.SUCCESS || '✅'} Deleted **${amount}** messages.`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // Advanced Purge Logic
    // We need to fetch messages first to filter them
    const messages = await message.channel.messages.fetch({ limit: amount });
    let filtered;

    switch (filterType) {
      case "bots":
        filtered = messages.filter(m => m.author.bot);
        break;
      case "humans":
        filtered = messages.filter(m => !m.author.bot);
        break;
      case "links":
        filtered = messages.filter(m => m.content.includes("http://") || m.content.includes("https://"));
        break;
      case "images":
      case "files":
        filtered = messages.filter(m => m.attachments.size > 0);
        break;
      case "embeds":
        filtered = messages.filter(m => m.embeds.length > 0);
        break;
      case "mentions":
        filtered = messages.filter(m => m.mentions.users.size > 0);
        break;
      case "contains":
        const sub = args.slice(2).join(" ");
        if (!sub) return message.reply("Usage: ,purge [amount] contains [text]");
        filtered = messages.filter(m => m.content.includes(sub));
        break;

      default:
        return message.reply("Unknown filter. Options: bots, humans, links, images, embeds, mentions, contains.");
    }

    if (filtered.size === 0) return message.reply("No messages matched the filter.");

    await message.channel.bulkDelete(filtered, true).catch(err => message.reply("Failed to delete messages (too old?)."));
    return message.channel.send(`${emojis.SUCCESS || '✅'} Deleted **${filtered.size}** filtered messages.`).then(m => setTimeout(() => m.delete(), 3000));
  },
};
