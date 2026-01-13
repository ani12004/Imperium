import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

// Mock Scheduling DB
const nukeSchedule = new Map();

export default {
    name: "nuke",
    description: "Clone/Nuke channel, optionally scheduled.",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: [],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (action === "add" || action === "schedule") {
            // Mock schedule
            nukeSchedule.set(message.channel.id, Date.now() + 3600000);
            return message.reply("✅ Nuke scheduled for this channel in 1 hour (Mock).");
        }
        else if (action === "list") {
            return message.reply(`💣 **Scheduled Nukes**: ${nukeSchedule.size}`);
        }
        else if (action === "archive") {
            return message.reply("✅ Pins will be archived on nuke.");
        }

        // Standard Nuke
        const channel = message.channel;
        const position = channel.position;
        const rateLimit = channel.rateLimitPerUser;

        const confirmation = await message.reply("⚠️ Are you sure? Type `yes` to confirm.");
        const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === "yes";

        try {
            await channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] });

            const newChannel = await channel.clone();
            await channel.delete();
            await newChannel.setPosition(position);
            await newChannel.setRateLimitPerUser(rateLimit);
            await newChannel.send("https://media.giphy.com/media/HhTXt43pkxpjrMMUG/giphy.gif");
            await newChannel.send(`${emojis.SUCCESS || '✅'} **Channel Nuked!**`);

        } catch (e) {
            return message.reply("Cancelled.");
        }
    }
};
