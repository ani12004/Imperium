import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "slowmode",
    description: "Set channel slowmode.",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["sm"],
    async execute(message, args) {
        const time = args[0];

        if (!time || time === "off" || time === "0") {
            await message.channel.setRateLimitPerUser(0);
            return message.reply(`${emojis.SUCCESS || '✅'} Slowmode disabled.`);
        }

        // Simple number parse (assume seconds)
        const seconds = parseInt(time);
        if (isNaN(seconds) || seconds > 21600) return message.reply("Invalid time (0-21600s).");

        await message.channel.setRateLimitPerUser(seconds);
        return message.reply(`${emojis.SUCCESS || '✅'} Slowmode set to **${seconds}s**.`);
    }
};
