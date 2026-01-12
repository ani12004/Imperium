import { PermissionsBitField, ChannelType, EmbedBuilder } from "discord.js";
import { setGuildConfig, getGuildConfig } from "../../utils/database.js";

export default {
    name: "voicemaster",
    description: "Manage temporary voice channels.",
    permissions: [],
    aliases: ["vm", "vc"],
    async execute(message, args) {
        const action = args[0];
        const config = await getGuildConfig(message.guild.id);

        if (action === "setup") {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("❌ You need Administrator permission.");

            try {
                const category = await message.guild.channels.create({
                    name: "VoiceMaster",
                    type: ChannelType.GuildCategory
                });

                const channel = await message.guild.channels.create({
                    name: "➕ Join to Create",
                    type: ChannelType.GuildVoice,
                    parent: category.id
                });

                const interfaceChannel = await message.guild.channels.create({
                    name: "interface",
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: message.guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.SendMessages]
                        }
                    ]
                });

                await setGuildConfig(message.guild.id, "voicemaster_category", category.id);
                await setGuildConfig(message.guild.id, "voicemaster_channel", channel.id);

                const embed = new EmbedBuilder()
                    .setColor("#00f3ff")
                    .setTitle("VoiceMaster Interface")
                    .setDescription("Click the buttons below to manage your voice channel.")
                    .setImage("https://media.discordapp.net/attachments/123/banner.png"); // Placeholder

                await interfaceChannel.send({ embeds: [embed] });

                return message.reply("✅ VoiceMaster setup complete.");
            } catch (e) {
                console.error(e);
                return message.reply("❌ Failed to setup VoiceMaster. Check my permissions.");
            }
        }

        // Check if user is in a voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("❌ You must be in a voice channel to use this.");

        // Check if it's a temp channel (simple check: is it in the VM category?)
        if (voiceChannel.parentId !== config.voicemaster_category) return message.reply("❌ You are not in a VoiceMaster channel.");

        // Check ownership (we can store owner in channel topic or DB, for simplicity let's assume topic contains ID or just check permissions if we set them on create)
        // For this implementation, we'll assume the user with ManageChannel permission on the channel is the owner
        const isOwner = voiceChannel.permissionsFor(message.member).has(PermissionsBitField.Flags.ManageChannels);

        if (action === "lock") {
            if (!isOwner) return message.reply("❌ You do not own this channel.");
            await voiceChannel.permissionOverwrites.edit(message.guild.roles.everyone, { Connect: false });
            return message.reply("🔒 Channel locked.");
        } else if (action === "unlock") {
            if (!isOwner) return message.reply("❌ You do not own this channel.");
            await voiceChannel.permissionOverwrites.edit(message.guild.roles.everyone, { Connect: true });
            return message.reply("🔓 Channel unlocked.");
        } else if (action === "permit") {
            if (!isOwner) return message.reply("❌ You do not own this channel.");
            const target = message.mentions.members.first();
            if (!target) return message.reply("❌ Mention a user to permit.");
            await voiceChannel.permissionOverwrites.edit(target, { Connect: true });
            return message.reply(`✅ ${target} permitted.`);
        } else if (action === "reject") {
            if (!isOwner) return message.reply("❌ You do not own this channel.");
            const target = message.mentions.members.first();
            if (!target) return message.reply("❌ Mention a user to reject.");
            await voiceChannel.permissionOverwrites.edit(target, { Connect: false });
            if (target.voice.channelId === voiceChannel.id) target.voice.disconnect();
            return message.reply(`🚫 ${target} rejected.`);
        } else if (action === "claim") {
            // Logic to claim if owner left
            // Check if current owner is present
            // This requires tracking owner more robustly.
            // For now, simple claim: if you are in it and no one has ManageChannels, you get it.
            // But we gave ManageChannels to owner.
            return message.reply("⚠️ Claim logic not fully implemented yet.");
        } else {
            return message.reply("❌ Usage: ,vm setup | lock | unlock | permit | reject");
        }
    },
};
