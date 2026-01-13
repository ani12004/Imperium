import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { setGuildConfig, getGuildConfig, setLogChannel } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "settings",
    description: "Server configuration settings.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: ["config", "conf"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            const config = await getGuildConfig(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(message.guild.members.me.displayHexColor)
                .setTitle(`${emojis.SETTINGS || '⚙️'} Server Configuration`)
                .setDescription(`Current settings for **${message.guild.name}**`)
                .addFields(
                    { name: "Prefix", value: `\`${config.prefix || ','}\``, inline: true },
                    { name: "Mod Log", value: config.mod_log_channel ? `<#${config.mod_log_channel}>` : "Not Set", inline: true },
                    { name: "Jail Channel", value: config.jail_channel ? `<#${config.jail_channel}>` : "Not Set", inline: true },
                    { name: "Muted Role", value: config.muted_role ? `<@&${config.muted_role}>` : "Not Set", inline: true },
                    { name: "Auto Nick", value: config.auto_nick || "Disabled", inline: true }
                )
                .setFooter({ text: "Use ,settings [option] [value] to change settings." });
            return message.channel.send({ embeds: [embed] });
        }

        switch (subcommand) {
            case "modlog":
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                if (!channel) return message.reply(`${emojis.ERROR || '❌'} Invalid channel.`);
                await setGuildConfig(message.guild.id, "mod_log_channel", channel.id);
                return message.reply(`${emojis.SUCCESS || '✅'} Mod log channel set to ${channel}.`);

            case "jail":
                const jailChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                if (!jailChannel) return message.reply(`${emojis.ERROR || '❌'} Invalid channel.`);
                await setGuildConfig(message.guild.id, "jail_channel", jailChannel.id);
                return message.reply(`${emojis.SUCCESS || '✅'} Jail channel set to ${jailChannel}.`);

            case "muted":
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                if (!role) return message.reply(`${emojis.ERROR || '❌'} Invalid role.`);
                await setGuildConfig(message.guild.id, "muted_role", role.id);
                return message.reply(`${emojis.SUCCESS || '✅'} Muted role set to ${role.name}.`);

            case "autonick":
                const nick = args.slice(1).join(" ");
                if (!nick) return message.reply(`${emojis.ERROR || '❌'} Please provide a nickname or 'off' to disable.`);
                if (nick.toLowerCase() === "off") {
                    await setGuildConfig(message.guild.id, "auto_nick", null);
                    return message.reply(`${emojis.SUCCESS || '✅'} Auto nickname disabled.`);
                }
                await setGuildConfig(message.guild.id, "auto_nick", nick);
                return message.reply(`${emojis.SUCCESS || '✅'} Auto nickname set to \`${nick}\`.`);

            case "reset":
                // Basic reset for demo
                return message.reply("Reset functionality not fully implemented yet.");

            default:
                return message.reply(`${emojis.ERROR || '❌'} Unknown subcommand. Options: modlog, jail, muted, autonick, config.`);
        }
    },
};
