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

        if (!action || action === "help") {
            return message.reply("❌ Usage: `.vm setup` | `.vm claim` | `.vm lock` | `.vm unlock` | `.vm permit @user` | `.vm reject @user`");
        }

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

                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import("discord.js");

                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('vm_lock').setLabel('Lock').setStyle(ButtonStyle.Secondary).setEmoji('🔒'),
                    new ButtonBuilder().setCustomId('vm_unlock').setLabel('Unlock').setStyle(ButtonStyle.Secondary).setEmoji('🔓'),
                    new ButtonBuilder().setCustomId('vm_hide').setLabel('Hide').setStyle(ButtonStyle.Secondary).setEmoji('👁️'),
                    new ButtonBuilder().setCustomId('vm_unhide').setLabel('Unhide').setStyle(ButtonStyle.Secondary).setEmoji('👀')
                );

                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('vm_claim').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('👑'),
                    new ButtonBuilder().setCustomId('vm_permit').setLabel('Permit').setStyle(ButtonStyle.Success).setEmoji('✅'),
                    new ButtonBuilder().setCustomId('vm_reject').setLabel('Reject').setStyle(ButtonStyle.Danger).setEmoji('🚫')
                );

                await interfaceChannel.send({ embeds: [embed], components: [row1, row2] });

                return message.reply("✅ VoiceMaster setup complete.");
            } catch (e) {
                console.error(e);
                return message.reply("❌ Failed to setup VoiceMaster. Check my permissions.");
            }
        }

        // Check if user is in a voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("❌ You must be in a voice channel to use this.");

        // Check if config exists
        if (!config || !config.voicemaster_category) return message.reply("❌ VoiceMaster is not set up. Ask an admin to run `.vm setup`.");

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
            const voiceChannel = message.member.voice.channel;
            // Check if current owner is present
            // We need to identify the current owner. 
            // In setup, we didn't explicitly store owner ID, but we can check who has ManageChannels.
            // However, previous code assumed "owner" had ManageChannels.
            // Let's find who currently has ManageChannels permission overwrite that is a member.

            // Filter overwrites for members with ManageChannels
            const ownerOverwrite = voiceChannel.permissionOverwrites.cache.find(perm =>
                perm.type === 1 && // Member
                perm.allow.has(PermissionsBitField.Flags.ManageChannels)
            );

            let currentOwnerId = ownerOverwrite ? ownerOverwrite.id : null;

            if (currentOwnerId === message.member.id) {
                return message.reply("⚠️ You already own this channel.");
            }

            // Check if current owner is in the channel
            if (currentOwnerId && voiceChannel.members.has(currentOwnerId)) {
                return message.reply("❌ The current owner is still in the channel.");
            }

            // Transfer ownership
            try {
                // Remove old owner permissions if exists
                if (currentOwnerId) {
                    await voiceChannel.permissionOverwrites.delete(currentOwnerId);
                }

                // Set new owner permissions
                await voiceChannel.permissionOverwrites.edit(message.member, {
                    ManageChannels: true,
                    Connect: true
                });

                // Update name (optional, but nice)
                // await voiceChannel.setName(`${message.member.user.username}'s Channel`);

                return message.reply("✅ You are now the owner of this channel.");

            } catch (e) {
                console.error("Claim Error:", e);
                return message.reply("❌ Failed to claim channel.");
            }
        } else {
            return message.reply("❌ Usage: ,vm setup | lock | unlock | permit | reject");
        }
    },
};
