import { PermissionsBitField } from "discord.js";
import { setGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "prefix",
    description: "Set custom prefix.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: ["setprefix"],
    async execute(message, args) {
        const action = args[0];
        const newPrefix = args[1];

        if (action !== "set" || !newPrefix) return message.reply(`${emojis.ERROR} Usage: ,prefix set [symbol]`);

        setGuildConfig(message.guild.id, "prefix", newPrefix);
        return message.reply(`${emojis.SUCCESS} Prefix updated to \`${newPrefix}\`.`);
    },
};
