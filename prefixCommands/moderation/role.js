import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "role",
    description: "Manage roles and mass role assignment.",
    permissions: [PermissionsBitField.Flags.ManageRoles],
    botPermissions: [PermissionsBitField.Flags.ManageRoles],
    aliases: ["r"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.reply(`${emojis.ERROR || '❌'} Usage: ,role [add/remove/create/delete/humans/bots/info] ...`);
        }

        switch (subcommand) {
            case "add": {
                const member = message.mentions.members.first() || await message.guild.members.fetch(args[1]).catch(() => null);
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
                if (!member || !role) return message.reply("Usage: ,role add @user @role");

                if (role.position >= message.guild.members.me.roles.highest.position) {
                    return message.reply("I cannot manage this role (it is higher than mine).");
                }

                await member.roles.add(role);
                return message.reply(`${emojis.SUCCESS || '✅'} Added **${role.name}** to **${member.user.tag}**.`);
            }

            case "remove": {
                const member = message.mentions.members.first() || await message.guild.members.fetch(args[1]).catch(() => null);
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
                if (!member || !role) return message.reply("Usage: ,role remove @user @role");

                if (role.position >= message.guild.members.me.roles.highest.position) {
                    return message.reply("I cannot manage this role (it is higher than mine).");
                }

                await member.roles.remove(role);
                return message.reply(`${emojis.SUCCESS || '✅'} Removed **${role.name}** from **${member.user.tag}**.`);
            }

            case "create": {
                const name = args.slice(1).join(" ");
                if (!name) return message.reply("Usage: ,role create [name]");

                const role = await message.guild.roles.create({ name: name, reason: `Created by ${message.author.tag}` });
                return message.reply(`${emojis.SUCCESS || '✅'} Created role **${role.name}**.`);
            }

            case "delete": {
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                if (!role) return message.reply("Usage: ,role delete @role");

                if (role.position >= message.guild.members.me.roles.highest.position) {
                    return message.reply("I cannot delete this role.");
                }

                const name = role.name;
                await role.delete(`Deleted by ${message.author.tag}`);
                return message.reply(`${emojis.SUCCESS || '✅'} Deleted role **${name}**.`);
            }

            case "humans": {
                const action = args[1]?.toLowerCase();
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);

                if (!["add", "remove"].includes(action) || !role) {
                    return message.reply("Usage: ,role humans [add/remove] @role");
                }

                if (role.position >= message.guild.members.me.roles.highest.position) {
                    return message.reply("I cannot assign this role.");
                }

                message.channel.send(`${emojis.LOADING || '⏳'} Processing humans... this might take a moment.`);

                const members = await message.guild.members.fetch();
                const humans = members.filter(m => !m.user.bot);
                let count = 0;

                for (const [id, member] of humans) {
                    try {
                        if (action === "add" && !member.roles.cache.has(role.id)) {
                            await member.roles.add(role);
                            count++;
                        } else if (action === "remove" && member.roles.cache.has(role.id)) {
                            await member.roles.remove(role);
                            count++;
                        }
                    } catch (e) { continue; }
                }
                return message.channel.send(`${emojis.SUCCESS || '✅'} ${action === "add" ? "Added" : "Removed"} **${role.name}** for **${count}** humans.`);
            }

            case "bots": {
                const action = args[1]?.toLowerCase();
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);

                if (!["add", "remove"].includes(action) || !role) {
                    return message.reply("Usage: ,role bots [add/remove] @role");
                }

                if (role.position >= message.guild.members.me.roles.highest.position) {
                    return message.reply("I cannot assign this role.");
                }

                message.channel.send(`${emojis.LOADING || '⏳'} Processing bots...`);

                const members = await message.guild.members.fetch();
                const bots = members.filter(m => m.user.bot);
                let count = 0;

                for (const [id, member] of bots) {
                    try {
                        if (action === "add" && !member.roles.cache.has(role.id)) {
                            await member.roles.add(role);
                            count++;
                        } else if (action === "remove" && member.roles.cache.has(role.id)) {
                            await member.roles.remove(role);
                            count++;
                        }
                    } catch (e) { continue; }
                }
                return message.channel.send(`${emojis.SUCCESS || '✅'} ${action === "add" ? "Added" : "Removed"} **${role.name}** for **${count}** bots.`);
            }

            case "info": {
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                if (!role) return message.reply("Usage: ,role info @role");

                const embed = new EmbedBuilder()
                    .setColor(role.color)
                    .setTitle(`Role Info: ${role.name}`)
                    .addFields(
                        { name: "ID", value: role.id, inline: true },
                        { name: "Color", value: role.hexColor, inline: true },
                        { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
                        { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
                        { name: "Position", value: `${role.position}`, inline: true },
                        { name: "Members", value: `${role.members.size}`, inline: true }
                    )
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            }

            default:
                return message.reply(`${emojis.ERROR || '❌'} Unknown subcommand. Options: add, remove, create, delete, humans, bots, info.`);
        }
    },
};
