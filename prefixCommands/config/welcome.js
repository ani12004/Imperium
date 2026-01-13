import { PermissionsBitField } from "discord.js";
import { setGuildConfig, getGuildConfig } from "../../utils/database.js";

export default {
    name: "welcome",
    description: "Configure welcome system.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: [],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (!action) return message.reply("❌ Usage: ,welcome [add/remove/view/list/variables]");

        switch (action) {
            case "add":
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                const msg = args.slice(2).join(" ");
                if (!channel || !msg) return message.reply("❌ Usage: ,welcome add #channel [message]");

                setGuildConfig(message.guild.id, "welcome_channel", channel.id);
                setGuildConfig(message.guild.id, "welcome_message", msg);
                return message.reply(`✅ Welcome message set for ${channel}.`);

            case "remove":
                setGuildConfig(message.guild.id, "welcome_channel", null);
                setGuildConfig(message.guild.id, "welcome_message", null);
                return message.reply("✅ Welcome message removed.");

            case "view":
                const config = await getGuildConfig(message.guild.id);
                if (!config.welcome_channel) return message.reply("❌ No welcome message set.");
                return message.reply(`**Channel**: <#${config.welcome_channel}>\n**Message**: \`${config.welcome_message}\``);

            case "list":
                // Since we only store 1 per guild in simple config, list is same as view
                return message.reply("This bot currently supports 1 welcome message per server. Use `,welcome view`.");

            case "variables":
                return message.reply("**Available Variables**:\n`{user}` - Mention user\n`{server}` - Server name\n`{count}` - Member count");

            default:
                return message.reply("❌ Usage: ,welcome [add/remove/view/list/variables]");
        }
    },
};
