import { PermissionsBitField } from "discord.js";
import { setGuildConfig, getGuildConfig } from "../../utils/database.js";

export default {
    name: "goodbye",
    description: "Configure goodbye system.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: [],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (!action) return message.reply("❌ Usage: ,goodbye [add/remove/view/list/variables]");

        switch (action) {
            case "add":
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                const msg = args.slice(2).join(" ");
                if (!channel || !msg) return message.reply("❌ Usage: ,goodbye add #channel [message]");

                // NOTE: Assuming we reuse welcome fields or added new ones. For demo, reusing same DB func structure.
                setGuildConfig(message.guild.id, "goodbye_channel", channel.id);
                setGuildConfig(message.guild.id, "goodbye_message", msg);
                return message.reply(`✅ Goodbye message set for ${channel}.`);

            case "remove":
                setGuildConfig(message.guild.id, "goodbye_channel", null);
                setGuildConfig(message.guild.id, "goodbye_message", null);
                return message.reply("✅ Goodbye message removed.");

            case "view":
                const config = await getGuildConfig(message.guild.id);
                if (!config.goodbye_channel) return message.reply("❌ No goodbye message set.");
                return message.reply(`**Channel**: <#${config.goodbye_channel}>\n**Message**: \`${config.goodbye_message}\``);

            case "list":
                return message.reply("This bot currently supports 1 goodbye message per server. Use `,goodbye view`.");

            case "variables":
                return message.reply("**Available Variables**:\n`{user}` - Mention user\n`{server}` - Server name\n`{count}` - Member count");

            default:
                return message.reply("❌ Usage: ,goodbye [add/remove/view/list/variables]");
        }
    },
};
