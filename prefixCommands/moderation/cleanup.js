import { PermissionsBitField } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "cleanup",
    description: "Server cleanup commands.",
    permissions: [PermissionsBitField.Flags.Administrator],
    aliases: ["unbanall", "clearinvites"],
    async execute(message, args) {
        const commandName = message.content.split(" ")[0].slice(1).toLowerCase();

        // --- UNBANALL ---
        if (commandName === "unbanall") {
            const confirmation = await message.reply("⚠️ This will unban EVERYONE. Type `confirm` to proceed.");
            const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === "confirm";
            try {
                await message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] });

                const bans = await message.guild.bans.fetch();
                if (bans.size === 0) return message.channel.send("No banned users.");

                message.channel.send(`Unbanning ${bans.size} members... (This may take a while)`);
                let count = 0;
                for (const [id, ban] of bans) {
                    await message.guild.members.unban(id).catch(() => { });
                    count++;
                }
                return message.channel.send(`✅ Unbanned **${count}** members.`);

            } catch (e) {
                return message.reply("Cancelled.");
            }
        }

        // --- CLEARINVITES ---
        if (commandName === "clearinvites") {
            const invites = await message.guild.invites.fetch();
            if (invites.size === 0) return message.reply("No invites found.");

            for (const [code, invite] of invites) {
                await invite.delete().catch(() => { });
            }
            return message.reply(`✅ Deleted **${invites.size}** invites.`);
        }

        return message.reply("Cleanup command error.");
    }
};
