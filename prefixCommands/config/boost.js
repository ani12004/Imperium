import { PermissionsBitField } from "discord.js";
import { setGuildConfig, getGuildConfig } from "../../utils/database.js";

export default {
    name: "boost",
    description: "Configure boost message system.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: ["boosts"],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (!action) return message.reply("❌ Usage: ,boost [add/remove/view/list/variables]");

        switch (action) {
            case "add":
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                const msg = args.slice(2).join(" ");
                if (!channel || !msg) return message.reply("❌ Usage: ,boost add #channel [message]");

                setGuildConfig(message.guild.id, "boost_channel", channel.id);
                setGuildConfig(message.guild.id, "boost_message", msg);
                return message.reply(`✅ Boost message set for ${channel}.`);

            case "remove":
                setGuildConfig(message.guild.id, "boost_channel", null);
                setGuildConfig(message.guild.id, "boost_message", null);
                return message.reply("✅ Boost message removed.");

            case "view":
                const config = await getGuildConfig(message.guild.id);
                if (!config.boost_channel) return message.reply("❌ No boost message set.");
                return message.reply(`**Channel**: <#${config.boost_channel}>\n**Message**: \`${config.boost_message}\``);

            case "list":
                return message.reply("This bot currently supports 1 boost message per server. Use `,boost view`.");

            case "variables":
                // Boost spec in filtered_commands implies it has variables
                return message.reply("**Available Variables**:\n`{user}` - Mention booster\n`{server}` - Server name\n`{count}` - Boost count");

            default:
                return message.reply("❌ Usage: ,boost [add/remove/view/list/variables]");
        }
    },
};
