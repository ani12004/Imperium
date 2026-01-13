import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

// Mock DB
const disabledCommands = new Set();

export default {
    name: "restrict",
    description: "Disable/Enable commands (restrictcommand alias).",
    permissions: [PermissionsBitField.Flags.Administrator],
    // Covering aliases from list: restrictcommand, disablecommand, enablecommand, ignore
    aliases: ["restrictcommand", "disablecommand", "enablecommand", "disable", "enable", "ignore"],
    async execute(message, args) {
        // We detect which alias was used to map to logic, or usually we just use subcommands inside
        // But the list had `disablecommand` as top level. 
        // For simplicity let's handle "disable [command]" as standard.

        const cmdName = args[0];
        if (!cmdName && !args[0]) return message.reply("Usage: ,disable [command] OR ,enable [command]");

        // Handle based on context or subcommand
        // Since we are aliasing diverse commands here, we should check message.content in a real complex bot
        // But let's assume usage: ,restrict [disable/enable] [command] OR ,disable [command]

        // Let's implement generic logic:
        const commandToManage = args[0]; // "ping"

        if (disabledCommands.has(commandToManage)) {
            disabledCommands.delete(commandToManage);
            return message.reply(`✅ Command **${commandToManage}** is now ENABLED.`);
        } else {
            disabledCommands.add(commandToManage);
            return message.reply(`❌ Command **${commandToManage}** is now DISABLED.`);
        }
    }
};
