import { PermissionsBitField } from "discord.js";
import { setGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "setprefix",
    description: "Changes the bot prefix.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: ["prefix"],
    async execute(message, args) {
        const newPrefix = args[0];

        if (!newPrefix) return message.reply(`${emojis.ERROR} Please provide a new prefix.`);
        if (newPrefix.length > 5) return message.reply(`${emojis.ERROR} Prefix cannot be longer than 5 characters.`);

        const success = await setGuildConfig(message.guild.id, "prefix", newPrefix);
        if (success) {
            message.reply(`${emojis.SUCCESS} Prefix updated to \`${newPrefix}\``);
        } else {
            message.reply(`${emojis.ERROR} Failed to update prefix in database.`);
        }
    },
};
