import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from "discord.js";
import { setGuildConfig, getGuildConfig } from "../../utils/database.js";

export default {
    data: new SlashCommandBuilder()
        .setName("antinuke")
        .setDescription("Configure anti-nuke protection system.")
        .addSubcommand(sub =>
            sub.setName("enable")
                .setDescription("Enable anti-nuke protection."))
        .addSubcommand(sub =>
            sub.setName("disable")
                .setDescription("Disable anti-nuke protection."))
        .addSubcommand(sub =>
            sub.setName("status")
                .setDescription("Check anti-nuke status.")),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === "enable") {
            await setGuildConfig(guildId, "antinuke_enabled", 1);
            return interaction.reply({ content: "✅ Anti-Nuke protection has been **ENABLED**.", ephemeral: false });
        } else if (subcommand === "disable") {
            await setGuildConfig(guildId, "antinuke_enabled", 0);
            return interaction.reply({ content: "⚠️ Anti-Nuke protection has been **DISABLED**.", ephemeral: false });
        } else if (subcommand === "status") {
            const config = await getGuildConfig(guildId);
            const status = config.antinuke_enabled ? "ENABLED" : "DISABLED";
            const embed = new EmbedBuilder()
                .setColor(config.antinuke_enabled ? "#00FF00" : "#FF0000")
                .setTitle("🛡️ Anti-Nuke Status")
                .setDescription(`Current Status: **${status}**`)
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    },
};
