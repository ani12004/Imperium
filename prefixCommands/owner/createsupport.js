import { PermissionsBitField, ChannelType, PermissionFlagsBits } from "discord.js";

export default {
    name: "createsupport",
    description: "Automatically sets up the support server with FULL permissions (Owner Only)",
    async execute(message, args, client) {
        // 1. Owner Check
        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply("❌ This command is restricted to the bot owner.");
        }

        const guild = message.guild;
        const botMember = guild.members.cache.get(client.user.id);

        // Check if bot has Administrator permission
        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ I need `Administrator` permission to set up the server.");
        }

        const statusMsg = await message.reply("🚀 Starting **Advanced** support server setup... This will configure all roles and permissions.");

        try {
            // ==========================================
            // 2. Create Roles with Specific Permissions
            // ==========================================
            const rolesConfig = [
                {
                    name: "Owner",
                    color: "#FF0000",
                    permissions: [PermissionFlagsBits.Administrator],
                    hoist: true
                },
                {
                    name: "Developer",
                    color: "#0000FF",
                    permissions: [PermissionFlagsBits.Administrator], // Devs usually need full access
                    hoist: true
                },
                {
                    name: "Admin",
                    color: "#00FF00",
                    permissions: [PermissionFlagsBits.Administrator],
                    hoist: true
                },
                {
                    name: "Moderator",
                    color: "#FFA500",
                    permissions: [
                        PermissionFlagsBits.KickMembers,
                        PermissionFlagsBits.BanMembers,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.MuteMembers,
                        PermissionFlagsBits.DeafenMembers,
                        PermissionFlagsBits.MoveMembers,
                        PermissionFlagsBits.ViewAuditLog,
                        PermissionFlagsBits.ManageNicknames
                    ],
                    hoist: true
                },
                {
                    name: "Support Team",
                    color: "#00FFFF",
                    permissions: [
                        PermissionFlagsBits.ManageMessages, // To manage ticket messages
                        PermissionFlagsBits.MuteMembers,
                        PermissionFlagsBits.ViewAuditLog
                    ],
                    hoist: true
                },
                {
                    name: "Premium User",
                    color: "#FFD700",
                    permissions: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.AttachFiles
                    ],
                    hoist: true
                },
                {
                    name: "Member",
                    color: "#808080",
                    permissions: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.AddReactions
                    ],
                    hoist: false
                },
                {
                    name: "Muted",
                    color: "#000000",
                    permissions: [], // No base permissions
                    hoist: false
                }
            ];

            const createdRoles = {};
            for (const roleData of rolesConfig) {
                // Check if role exists to avoid duplicates
                let role = guild.roles.cache.find(r => r.name === roleData.name);
                if (!role) {
                    role = await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        permissions: roleData.permissions,
                        hoist: roleData.hoist,
                        reason: "Support Server Setup"
                    });
                }
                createdRoles[roleData.name] = role;
            }

            // ==========================================
            // 3. Create Categories and Channels
            // ==========================================
            const structure = [
                {
                    name: "📢 INFORMATION",
                    type: "info", // Custom type for logic
                    channels: [
                        { name: "👋・welcome", type: ChannelType.GuildText },
                        { name: "📜・rules", type: ChannelType.GuildText },
                        { name: "📢・announcements", type: ChannelType.GuildText },
                        { name: "🔗・links", type: ChannelType.GuildText },
                        { name: "📊・status", type: ChannelType.GuildText }
                    ]
                },
                {
                    name: "🎫 SUPPORT",
                    type: "support",
                    channels: [
                        { name: "🎫・open-ticket", type: ChannelType.GuildText, special: "ticket_panel" },
                        { name: "🐛・bug-reports", type: ChannelType.GuildText },
                        { name: "💡・suggestions", type: ChannelType.GuildText }
                    ]
                },
                {
                    name: "💬 COMMUNITY",
                    type: "community",
                    channels: [
                        { name: "💬・general", type: ChannelType.GuildText },
                        { name: "🤖・bot-commands", type: ChannelType.GuildText },
                        { name: "📷・media", type: ChannelType.GuildText },
                        { name: "🐸・dank-memes", type: ChannelType.GuildText }
                    ]
                },
                {
                    name: "💰 ECONOMY & SOCIAL",
                    type: "community",
                    channels: [
                        { name: "💸・flex", type: ChannelType.GuildText },
                        { name: "💍・marriages", type: ChannelType.GuildText }
                    ]
                },
                {
                    name: "🛡️ STAFF AREA",
                    type: "staff",
                    channels: [
                        { name: "🛡️・staff-chat", type: ChannelType.GuildText },
                        { name: "📝・todo-list", type: ChannelType.GuildText },
                        { name: "📜・audit-logs", type: ChannelType.GuildText }
                    ]
                }
            ];

            for (const catData of structure) {
                const category = await guild.channels.create({
                    name: catData.name,
                    type: ChannelType.GuildCategory
                });

                // --- CATEGORY PERMISSIONS ---

                // 1. Default: Deny View for Everyone (We will allow explicitly)
                // Actually, for community/info, we want View=True.
                // Let's handle per Type.

                if (catData.type === "info") {
                    // Everyone: View YES, Send NO
                    await category.permissionOverwrites.create(guild.id, { ViewChannel: true, SendMessages: false });
                    // Staff: Send YES
                    if (createdRoles["Admin"]) await category.permissionOverwrites.create(createdRoles["Admin"], { SendMessages: true });
                    if (createdRoles["Owner"]) await category.permissionOverwrites.create(createdRoles["Owner"], { SendMessages: true });
                }
                else if (catData.type === "community") {
                    // Everyone: View YES, Send YES
                    await category.permissionOverwrites.create(guild.id, { ViewChannel: true, SendMessages: true });
                    // Muted: Send NO
                    if (createdRoles["Muted"]) await category.permissionOverwrites.create(createdRoles["Muted"], { SendMessages: false, AddReactions: false });
                }
                else if (catData.type === "support") {
                    // Everyone: View YES, Send YES (except ticket panel)
                    await category.permissionOverwrites.create(guild.id, { ViewChannel: true, SendMessages: true });
                    if (createdRoles["Muted"]) await category.permissionOverwrites.create(createdRoles["Muted"], { SendMessages: false });
                }
                else if (catData.type === "staff") {
                    // Everyone: View NO
                    await category.permissionOverwrites.create(guild.id, { ViewChannel: false });
                    // Allow Staff
                    const staffRoles = ["Support Team", "Moderator", "Admin", "Owner", "Developer"];
                    for (const roleName of staffRoles) {
                        if (createdRoles[roleName]) {
                            await category.permissionOverwrites.create(createdRoles[roleName], { ViewChannel: true, SendMessages: true });
                        }
                    }
                }

                // --- CHANNEL CREATION & OVERRIDES ---
                for (const chanData of catData.channels) {
                    const channel = await guild.channels.create({
                        name: chanData.name,
                        type: chanData.type,
                        parent: category.id
                    });

                    // Special Channel Overrides
                    if (chanData.special === "ticket_panel") {
                        // #open-ticket: Everyone View YES, Send NO
                        await channel.permissionOverwrites.create(guild.id, { ViewChannel: true, SendMessages: false });
                    }
                }
            }

            await statusMsg.edit("✅ **Advanced Setup Complete!**\n\n• **Roles:** Created with specific permissions (Mod, Support, Member, etc.).\n• **Channels:** Configured with correct overrides (Muted role, Read-only channels, Staff access).");

        } catch (error) {
            console.error(error);
            await statusMsg.edit(`❌ An error occurred during setup: ${error.message}`);
        }
    }
};
