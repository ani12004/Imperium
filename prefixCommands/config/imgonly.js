import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

const imgOnlyChannels = new Set();

export default {
    name: "imgonly",
    description: "Restrict channel to images only.",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["imageonly"],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (!action) return message.reply("Usage: ,imgonly [add/remove/list]");

        switch (action) {
            case "add":
                const ch = message.mentions.channels.first() || message.channel;
                imgOnlyChannels.add(ch.id);
                return message.reply(`✅ ${ch} is now **Image Only**.`);

            case "remove":
                const rCh = message.mentions.channels.first() || message.channel;
                imgOnlyChannels.delete(rCh.id);
                return message.reply(`✅ ${rCh} is no longer Image Only.`);

            case "list":
                return message.reply(`📝 **Image Only Channels**: ${imgOnlyChannels.size}`);

            default:
                return message.reply("Usage: ,imgonly [add/remove/list]");
        }
    }
};
