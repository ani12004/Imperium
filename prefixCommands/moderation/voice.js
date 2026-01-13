import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "voice",
    description: "Voice channel management commands.",
    permissions: [PermissionsBitField.Flags.MoveMembers],
    aliases: ["drag", "moveall", "vmove"], // aliases map to the specific function logic
    async execute(message, args) {
        const commandName = message.content.split(" ")[0].slice(1).toLowerCase(); // crude alias check

        // --- DRAG COMMAND ---
        if (commandName === "drag" || (args[0] && args[0].toLowerCase() === "drag")) {
            const member = message.mentions.members.first();
            const channel = message.mentions.channels.first() || message.member.voice.channel;

            if (!member) return message.reply("Usage: ,drag @user [#channel]");
            if (!member.voice.channel) return message.reply("User is not in a voice channel.");
            if (!channel || !channel.isVoiceBased()) return message.reply("Invalid voice channel.");

            try {
                await member.voice.setChannel(channel);
                return message.reply(`✅ Moved **${member.user.tag}** to **${channel.name}**.`);
            } catch (e) {
                return message.reply("Failed to move member.");
            }
        }

        // --- MOVEALL COMMAND ---
        if (commandName === "moveall" || (args[0] && args[0].toLowerCase() === "moveall")) {
            // Usage: ,moveall #channel (moves everyone from current channel to target)
            // OR ,moveall #from #to
            const currentChannel = message.member.voice.channel;
            const targetChannel = message.mentions.channels.first();

            if (!currentChannel) return message.reply("You must be in a voice channel.");
            if (!targetChannel || !targetChannel.isVoiceBased()) return message.reply("Usage: ,moveall #target_channel");

            const members = currentChannel.members;
            if (members.size === 0) return message.reply("No members to move.");

            let count = 0;
            for (const [id, member] of members) {
                try {
                    await member.voice.setChannel(targetChannel);
                    count++;
                } catch (e) { }
            }
            return message.reply(`✅ Moved **${count}** members to **${targetChannel.name}**.`);
        }

        return message.reply("Voice command error.");
    }
};
