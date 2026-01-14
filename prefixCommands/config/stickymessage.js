
import { PermissionsBitField, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "stickymessage",
    description: "Set up sticky messages",
    permissions: [PermissionsBitField.Flags.ManageMessages],
    aliases: ["sticky", "sm"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();
        const guildId = message.guild.id;
        const channelId = message.channel.id;

        if (!subcommand) return message.reply("Usage: ,sticky [add/remove/list/view]");

        if (subcommand === "add") {
            const content = args.slice(1).join(" ");
            if (!content) return message.reply("Usage: ,sticky add [message]");

            const { error } = await db.from('sticky_messages').upsert({
                channel_id: channelId,
                guild_id: guildId,
                message: content
            });

            if (error) return message.reply(`${emojis.ERROR} Failed: ${error.message}`);

            // Update Cache
            message.client.stickyMessages.set(channelId, { text: content, lastId: null });

            return message.reply(`${emojis.SUCCESS} Sticky message set for this channel.`);
        }

        if (subcommand === "remove") {
            const { error } = await db.from('sticky_messages').delete().eq('channel_id', channelId);
            if (error) return message.reply(`${emojis.ERROR} Error: ${error.message}`);

            // Update Cache
            message.client.stickyMessages.delete(channelId);

            return message.reply(`${emojis.SUCCESS} Sticky message removed.`);
        }

        if (subcommand === "list") {
            const { data } = await db.from('sticky_messages').select('*').eq('guild_id', guildId);
            if (!data || data.length === 0) return message.reply("No sticky messages.");

            const list = data.map(s => `<#${s.channel_id}>: ${s.message.substring(0, 30)}...`).join("\n");
            const embed = new EmbedBuilder().setTitle("Sticky Messages").setDescription(list).setColor("#2b2d31");
            return message.reply({ embeds: [embed] });
        }

        return message.reply("Usage: ,sticky [add/remove/list]");
    }
};