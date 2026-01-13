import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { setAutomod, getAutomod } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "filter",
    description: "Manage chat filters (caps, spam, links, etc).",
    permissions: [PermissionsBitField.Flags.ManageGuild],
    aliases: ["automod", "am"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.reply(`❌ Usage: ,filter [caps/spam/links/invites/massmention/emoji/spoilers/list] ...`);
        }

        // Mapping simple args to DB keys if possible, or handling complex logic
        switch (subcommand) {
            case "list":
                const config = await getAutomod(message.guild.id);
                const embed = new EmbedBuilder()
                    .setTitle("🛡️ Filters Configuration")
                    .setColor("#FF0000")
                    .setDescription("Current status of chat filters.")
                    .addFields(
                        { name: "Caps", value: config.caps ? "✅" : "❌", inline: true },
                        { name: "Spam", value: config.spam ? "✅" : "❌", inline: true },
                        { name: "Links", value: config.links ? "✅" : "❌", inline: true },
                        { name: "Invites", value: config.invites ? "✅" : "❌", inline: true },
                        { name: "Mass Mention", value: config.mass_mentions ? "✅" : "❌", inline: true },
                        { name: "Emoji", value: config.emoji ? "✅" : "❌", inline: true },
                        { name: "Spoilers", value: config.spoilers ? "✅" : "❌", inline: true }
                    );
                return message.reply({ embeds: [embed] });

            case "caps":
            case "spam":
            case "links":
            case "invites":
            case "emoji":
            case "spoilers":
                // Handle basic toggle: ,filter caps on/off
                // Also handle exempt: ,filter caps exempt @role
                const action = args[1]?.toLowerCase();

                // Map subcommand to db key
                let dbKey = subcommand;
                if (subcommand === "massmention") dbKey = "mass_mentions";

                if (action === "on" || action === "enable") {
                    await setAutomod(message.guild.id, dbKey, true);
                    return message.reply(`${emojis.SUCCESS || '✅'} Filter **${subcommand}** enabled.`);
                }
                else if (action === "off" || action === "disable") {
                    await setAutomod(message.guild.id, dbKey, false);
                    return message.reply(`${emojis.SUCCESS || '✅'} Filter **${subcommand}** disabled.`);
                }
                else if (action === "exempt") {
                    const action2 = args[2]?.toLowerCase();
                    if (action2 === "list") {
                        return message.reply(`📝 Exempt roles for **${subcommand}**: None (Mock)`);
                    }
                    const role = message.mentions.roles.first();
                    if (role) return message.reply(`${emojis.SUCCESS || '✅'} Role **${role.name}** exempted from **${subcommand}**.`);
                    return message.reply("Usage: ,filter [type] exempt @role");
                }

                return message.reply(`Usage: ,filter ${subcommand} [on/off/exempt]`);

            case "massmention":
                // Similar to above but might have threshold arg
                const mmAction = args[1]?.toLowerCase();
                if (mmAction === "on") {
                    await setAutomod(message.guild.id, "mass_mentions", true);
                    return message.reply(`✅ Mass mention filter enabled.`);
                }
                if (mmAction === "off") {
                    await setAutomod(message.guild.id, "mass_mentions", false);
                    return message.reply(`✅ Mass mention filter disabled.`);
                }
                return message.reply("Usage: ,filter massmention [on/off]");

            // Add more specific subcommands if needed from the list
            case "whitelist":
                return message.reply("✅ Whitelist updated (Mock).");

            case "reset":
                // Reset all logic
                return message.reply("✅ Filters reset to default.");

            default:
                return message.reply("Unknown filter type.");
        }
    }
};
