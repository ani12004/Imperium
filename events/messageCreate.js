import { Events, ChannelType, PermissionsBitField, EmbedBuilder } from 'discord.js';
import db, { getGuildConfig, updateUser, getUser, getAFK, removeAFK } from '../utils/database.js';
import { checkRules } from '../utils/checkRules.js';
import moment from 'moment';


const cooldowns = new Map();
const spamMap = new Map();

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        try {
            if (message.author.bot) return;

            if (!message.guild) return;

            const userId = message.author.id;
            const guildId = message.guild.id;
            // --- STICKY MESSAGES ---
            const stickyData = client.stickyMessages.get(message.channel.id);
            if (stickyData) {
                // Delete old one if exists
                if (stickyData.lastId) {
                    message.channel.messages.delete(stickyData.lastId).catch(() => { });
                }

                // Send new one
                const embed = new EmbedBuilder()
                    .setDescription(stickyData.text)
                    .setColor("#2b2d31")
                    .setFooter({ text: "Sticky Message" });

                const sentMsg = await message.channel.send({ embeds: [embed] });
                stickyData.lastId = sentMsg.id;
                client.stickyMessages.set(message.channel.id, stickyData);
            }
            // -----------------------

            // --- AUTO MODERATION ---
            // 1. Bad Words Filter
            const badWords = ["badword1", "badword2", "scam"]; // Example list
            if (badWords.some(word => message.content.toLowerCase().includes(word))) {
                // Check if user has admin/mod perms to bypass
                if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    await message.delete().catch(() => { });
                    return message.channel.send(`${message.author}, watch your language! ⚠️`).then(m => setTimeout(() => m.delete(), 5000));
                }
            }

            // 2. Anti-Spam (Simple Rate Limit: 5 messages in 5 seconds)
            if (!spamMap.has(userId)) {
                spamMap.set(userId, []);
            }
            const userHistory = spamMap.get(userId);
            userHistory.push(now);

            // Remove messages older than 5 seconds
            const recentMessages = userHistory.filter(timestamp => now - timestamp < 5000);
            spamMap.set(userId, recentMessages);

            if (recentMessages.length > 5) {
                if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    // Timeout for 1 minute
                    await message.member.timeout(60 * 1000, "Anti-Spam Auto-Mod").catch(() => { });
                    return message.channel.send(`${message.author} has been muted for spamming. 🔇`);
                }
            }
            // -----------------------

            // --- AFK SYSTEM ---
            // 1. Check if Author is AFK -> Remove AFK
            // 1. Check if Author is AFK -> Remove AFK
            const authorAFK = await getAFK(userId);
            if (authorAFK) {
                await removeAFK(userId);
                const duration = moment.duration(Date.now() - authorAFK.timestamp).humanize();
                message.channel.send(`👋 Welcome back **${message.author.username}**! You were AFK for ${duration}.`);

                // Restore nickname if it has [AFK] tag
                if (message.member.manageable && message.guild.members.me.permissions.has("ManageNicknames")) {
                    const currentNick = message.member.nickname;
                    if (currentNick && currentNick.startsWith("[AFK] ")) {
                        const originalNick = currentNick.replace("[AFK] ", "");
                        await message.member.setNickname(originalNick).catch(() => { });
                    }
                }
            }

            // 2. Check Mentions -> Report AFK
            if (message.mentions.users.size > 0) {
                for (const [mentionedId, mentionedUser] of message.mentions.users) {
                    if (mentionedId === userId || mentionedUser.bot) continue;

                    if (mentionedId === userId || mentionedUser.bot) continue;

                    const targetAFK = await getAFK(mentionedId);
                    if (targetAFK) {
                        const duration = moment.duration(Date.now() - targetAFK.timestamp).humanize();
                        const embed = new EmbedBuilder()
                            .setColor("#F59E0B") // Premium Gold
                            .setAuthor({ name: `${mentionedUser.username} is AFK`, iconURL: mentionedUser.displayAvatarURL() })
                            .setDescription(`> ${targetAFK.reason}`)
                            .addFields({ name: 'Since', value: `${duration} ago`, inline: true })
                            .setFooter({ text: 'Imperium • User is unavailable' });
                        message.channel.send({ embeds: [embed] });
                    }
                }
            }
            // ------------------

            // --- XP SYSTEM ---
            if (!cooldowns.has(userId)) {
                cooldowns.set(userId, now);
                setTimeout(() => cooldowns.delete(userId), 60000); // 1 min cooldown

                const user = await getUser(userId, guildId);
                const xpGain = Math.floor(Math.random() * 10) + 15; // 15-25 XP
                const newXp = user.xp + xpGain;
                const nextLevel = (user.level + 1) * 100;

                let newLevel = user.level;
                if (newXp >= nextLevel) {
                    newLevel++;
                    message.channel.send(`🎉 ${message.author}, you leveled up to **Level ${newLevel}**!`);
                }

                await updateUser(userId, guildId, { xp: newXp, level: newLevel });
            }
            // -----------------

            // --- COMMAND HANDLING ---
            const config = await getGuildConfig(guildId);
            const prefix = config.prefix || ',';

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = client.prefixCommands.get(commandName);

            if (!command) return;

            // Permissions Check
            if (command.permissions) {
                if (!message.member.permissions.has(command.permissions)) {
                    return message.reply({ content: `❌ You need \`${command.permissions}\` permission to use this command.` });
                }
            }

            // Bot Permissions Check
            if (command.botPermissions) {
                if (!message.guild.members.me.permissions.has(command.botPermissions)) {
                    return message.reply({ content: `❌ I need \`${command.botPermissions}\` permission to execute this command.` });
                }
            }

            // Global Rules Check
            if (!await checkRules(message, message.author.id)) return;

            await command.execute(message, args, client);

        } catch (error) {
            console.error("Message Event Error:", error);
            // Try to reply if possible
            if (message && message.channel) {
                message.reply({ content: '❌ A critical error occurred while processing your message.' }).catch(() => { });
            }
        }
    },
};
