import { PermissionsBitField } from "discord.js";

const notesDB = new Map(); // userID -> string[]
const forcedNicks = new Map(); // userID -> nickname

export default {
    name: "miscmod",
    description: "Miscellaneous mod commands.",
    permissions: [PermissionsBitField.Flags.ManageMessages],
    aliases: ["forcenickname", "notes", "naughty"],
    async execute(message, args) {
        const commandName = message.content.split(" ")[0].slice(1).toLowerCase();

        // --- FORCE NICKNAME ---
        if (commandName === "forcenickname" || commandName === "fn") {
            const target = message.mentions.members.first();
            const nick = args.slice(1).join(" ");
            if (!target || !nick) return message.reply("Usage: ,forcenickname @user [nickname/off]");

            if (nick === "off") {
                forcedNicks.delete(target.id);
                return message.reply(`✅ Stopped forcing nickname for **${target.user.tag}**.`);
            }

            forcedNicks.set(target.id, nick);
            await target.setNickname(nick).catch(() => null);
            return message.reply(`✅ Forced nickname **${nick}** on **${target.user.tag}**.`);
        }

        // --- NAUGHTY ---
        if (commandName === "naughty") {
            // Temp NSFW toggle
            const channel = message.channel;
            if (channel.nsfw) return message.reply("Channel is already NSFW.");

            await channel.edit({ nsfw: true });
            message.reply("🔞 Channel is now **NSFW** for 30 seconds!");

            setTimeout(async () => {
                await channel.edit({ nsfw: false });
                message.channel.send("😇 Channel is back to SFW.");
            }, 30000);
            return;
        }

        // --- NOTES ---
        if (commandName === "notes") {
            const action = args[0]; // add/remove/list/clear? Or just ,notes @user
            // Usage: ,notes @user -> list. ,notes add @user [text]
            const target = message.mentions.users.first();

            if (action === "add" && target) {
                const text = args.slice(2).join(" ");
                if (!notesDB.has(target.id)) notesDB.set(target.id, []);
                notesDB.get(target.id).push(text);
                return message.reply("✅ Note added.");
            }

            if (target) {
                const notes = notesDB.get(target.id) || [];
                if (notes.length === 0) return message.reply("No notes for this user.");
                return message.reply(`📝 **Notes**: \n${notes.map((n, i) => `${i + 1}. ${n}`).join("\n")}`);
            }

            return message.reply("Usage: ,notes add @user [note] OR ,notes @user");
        }
    }
};
