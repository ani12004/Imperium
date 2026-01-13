import { PermissionsBitField } from "discord.js";

export default {
    name: "thread",
    description: "Manage threads.",
    permissions: [PermissionsBitField.Flags.ManageThreads],
    aliases: ["threads"],
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (!message.channel.isThread()) return message.reply("You must be in a thread to use these commands (simplification).");
        const thread = message.channel;

        switch (action) {
            case "lock":
                await thread.setLocked(true);
                return message.reply("🔒 Thread locked.");
            case "unlock":
                await thread.setLocked(false);
                return message.reply("🔓 Thread unlocked.");
            case "archive":
                await thread.setArchived(true);
                return; // Can't reply if archived instantly
            case "rename":
                const name = args.slice(1).join(" ");
                if (!name) return message.reply("Usage: ,thread rename [new name]");
                await thread.setName(name);
                return message.reply(`✅ Renamed thread to **${name}**.`);
            default:
                return message.reply("Usage: ,thread [lock/unlock/archive/rename]");
        }
    }
};
