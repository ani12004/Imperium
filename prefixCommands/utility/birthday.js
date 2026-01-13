import { PermissionsBitField } from "discord.js";
import { setGuildConfig } from "../../utils/database.js";

export default {
    name: "birthday",
    description: "Manage birthdays.",
    permissions: [],
    aliases: ["bday"],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        switch (action) {
            case "set":
                // ,bday set 20-04 (DD-MM)
                const date = args[1]; // Validate format
                return message.reply(`✅ Birthday set to ${date} (Mock).`);

            case "list":
                return message.reply("📝 **Birthdays**: None");

            case "channel":
                const ch = message.mentions.channels.first();
                if (ch) {
                    setGuildConfig(message.guild.id, "birthday_channel", ch.id);
                    return message.reply(`✅ Birthday channel set to ${ch}`);
                }
                return message.reply("Usage: ,birthday channel #channel");

            default:
                return message.reply("Usage: ,birthday [set/list/channel/role/remove]");
        }
    }
};
