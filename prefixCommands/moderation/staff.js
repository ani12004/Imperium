import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { getWarnings } from "../../utils/database.js"; // Reuse getWarnings for history mock

export default {
    name: "staff",
    description: "Staff management and history.",
    permissions: [PermissionsBitField.Flags.ManageGuild],
    aliases: ["stripstaff", "modstats", "history", "moderationhistory"],
    async execute(message, args) {
        const commandName = message.content.split(" ")[0].slice(1).toLowerCase();
        const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);

        // --- STRIPSTAFF ---
        if (commandName === "stripstaff") {
            if (!target) return message.reply("Usage: ,stripstaff @user");

            // Dangerous! Filters roles with Admin or Kick/Ban permissions
            const staffRoles = target.roles.cache.filter(r =>
                r.permissions.has(PermissionsBitField.Flags.Administrator) ||
                r.permissions.has(PermissionsBitField.Flags.KickMembers) ||
                r.permissions.has(PermissionsBitField.Flags.BanMembers) ||
                r.permissions.has(PermissionsBitField.Flags.ManageMessages)
            );

            if (staffRoles.size === 0) return message.reply("User has no dangerous staff roles.");

            await target.roles.remove(staffRoles);
            return message.reply(`✅ Removed **${staffRoles.size}** staff roles from **${target.user.tag}**.`);
        }

        // --- CONTENT / HISTORY ---
        if (commandName === "history" || commandName === "moderationhistory") {
            if (!target) return message.reply("Usage: ,history @user");
            // Reuse warnings DB for now as a proxy for history
            const warnings = getWarnings(message.guild.id, target.id);
            if (warnings.length === 0) return message.reply("No recorded history (using warnings db).");

            const embed = new EmbedBuilder()
                .setTitle(`History: ${target.user.tag}`)
                .setDescription(warnings.map((w, i) => `**Case ${i + 1}**: ${w.reason} (<t:${Math.floor(w.timestamp / 1000)}:R>)`).join("\n"));
            return message.reply({ embeds: [embed] });
        }

        // --- MODSTATS ---
        if (commandName === "modstats") {
            // Requires complex DB tracking of *who* warned/kicked *whom*.
            // For now, mock response.
            const mod = target || message.member;
            return message.reply(`📊 **Mod Stats for ${mod.user.tag}**\nBans: 0\nKicks: 0\nMutes: 0\nWarns: 0\n(Note: Tracking not fully implemented in DB schema yet)`);
        }

        return message.reply("Staff command error.");
    }
};
