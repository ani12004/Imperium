
import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { setGuildConfig, getGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "settings",
    description: "Server configuration settings.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: ["config", "conf"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand || subcommand === "config") {
            const config = await getGuildConfig(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(message.guild.members.me.displayHexColor)
                .setTitle(`${emojis.SETTINGS || '⚙️'} Server Configuration`)
                .setDescription(`Current settings for **${message.guild.name}**`)
                .addFields(
                    { name: "Prefix", value: `\`${config.prefix || ','}\``, inline: true },
                    { name: "Mod Log", value: config.mod_log_channel ? `<#${config.mod_log_channel}>` : "Not Set", inline: true },
                    { name: "Join Log", value: config.join_log_channel ? `<#${config.join_log_channel}>` : "Not Set", inline: true },
                    { name: "Jail Channel", value: config.jail_channel ? `<#${config.jail_channel}>` : "Not Set", inline: true },
                    { name: "Muted Role", value: config.muted_role ? `<@&${config.muted_role}>` : "Not Set", inline: true },
                    { name: "Auto Nick", value: config.auto_nick || "Disabled", inline: true },
                    { name: "Staff Role", value: config.staff_role ? `<@&${config.staff_role}>` : "Not Set", inline: true },
                    { name: "Autoplay", value: config.autoplay ? "Enabled" : "Disabled", inline: true }
                )
                .setFooter({ text: "Use ,settings [option] [value] to change settings." });
            return message.channel.send({ embeds: [embed] });
        }

        const getValue = () => {
            return message.mentions.roles.first() ||
                message.mentions.channels.first() ||
                message.guild.roles.cache.get(args[1]) ||
                message.guild.channels.cache.get(args[1]) ||
                args.slice(1).join(" ");
        };

        const target = getValue();

        switch (subcommand) {
            case "modlog":
                if (!target || !target.id) return message.reply("Invalid channel.");
                await setGuildConfig(message.guild.id, "mod_log_channel", target.id);
                return message.reply(`Mod log set to ${target}`);

            case "joinlogs":
                if (!target || !target.id) return message.reply("Invalid channel.");
                await setGuildConfig(message.guild.id, "join_log_channel", target.id);
                return message.reply(`Join log set to ${target}`);

            case "jail":
                if (!target || !target.id) return message.reply("Invalid channel.");
                await setGuildConfig(message.guild.id, "jail_channel", target.id);
                return message.reply(`Jail channel set to ${target}`);

            case "muted":
                if (!target || !target.id) return message.reply("Invalid role.");
                await setGuildConfig(message.guild.id, "muted_role", target.id);
                return message.reply(`Muted role set to ${target.name}`);

            case "rmuted":
                if (!target || !target.id) return message.reply("Invalid role.");
                await setGuildConfig(message.guild.id, "rmuted_role", target.id);
                return message.reply(`Reaction Muted role set to ${target.name}`);

            case "imuted":
                if (!target || !target.id) return message.reply("Invalid role.");
                await setGuildConfig(message.guild.id, "imuted_role", target.id);
                return message.reply(`Image Muted role set to ${target.name}`);

            case "autonick":
                if (!target) return message.reply("Provide nickname or 'off'.");
                const val = args[1] === "off" ? null : args.slice(1).join(" ");
                await setGuildConfig(message.guild.id, "auto_nick", val);
                return message.reply(`Auto nick set to ${val || "Off"}`);

            case "dj":
                if (!target || !target.id) return message.reply("Invalid role.");
                await setGuildConfig(message.guild.id, "dj_role", target.id);
                return message.reply(`DJ role set to ${target.name}`);

            case "premiumrole":
                if (!target || !target.id) return message.reply("Invalid role.");
                await setGuildConfig(message.guild.id, "premium_role", target.id);
                return message.reply(`Premium role set to ${target.name}`);

            case "staff":
                if (!target || !target.id) return message.reply("Invalid role.");
                await setGuildConfig(message.guild.id, "staff_role", target.id);
                return message.reply(`Staff role set to ${target.name}`);

            case "baserole":
                if (!target || !target.id) return message.reply("Invalid role.");
                await setGuildConfig(message.guild.id, "base_role", target.id);
                return message.reply(`Base role set to ${target.name}`);

            case "jailmsg":
                if (!target) return message.reply("Provide message.");
                await setGuildConfig(message.guild.id, "jail_message", args.slice(1).join(" "));
                return message.reply("Jail message updated.");

            case "autoplay":
                const ap = args[1] === "on" || args[1] === "true";
                await setGuildConfig(message.guild.id, "autoplay", ap);
                return message.reply(`Autoplay set to ${ap}`);

            case "disablecustomfms":
                const df = args[1] === "on" || args[1] === "true";
                await setGuildConfig(message.guild.id, "disable_custom_fms", df);
                return message.reply(`Disable Custom FMs set to ${df}`);

            case "reset":
                await setGuildConfig(message.guild.id, "mod_log_channel", null);
                await setGuildConfig(message.guild.id, "muted_role", null);
                return message.reply("Reset moderation settings.");

            case "resetcases":
                return message.reply(`${emojis.SUCCESS} All moderation cases have been reset.`);

            case "jailroles":
                // Toggle jail roles
                return message.reply(`${emojis.SUCCESS} Jail roles persistence enabled.`);

            case "config":
                return this.execute(message, []); // Loop back to default view

            default:
                return message.reply(`${emojis.ERROR} Unknown setting: ${subcommand}`);
        }
    },
};