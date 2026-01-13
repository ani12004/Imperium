import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from "discord.js";
import { setGuildConfig, getGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    data: new SlashCommandBuilder()
        .setName("antiraid")
        .setDescription("Configure anti-raid protection system.")
        .addSubcommand(sub =>
            sub.setName("enable")
                .setDescription("Enable anti-raid protection."))
        .addSubcommand(sub =>
            sub.setName("disable")
                .setDescription("Disable anti-raid protection."))
        .addSubcommand(sub =>
            sub.setName("status")
                .setDescription("Check anti-raid status.")),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: `${emojis.ERROR} You need Administrator permission.`, ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === "enable") {
            await setGuildConfig(guildId, "antiraid_enabled", 1);
            return interaction.reply({ content: `${emojis.SUCCESS} Anti-Raid protection has been **ENABLED**.`, ephemeral: false });
        } else if (subcommand === "disable") {
            await setGuildConfig(guildId, "antiraid_enabled", 0);
            return interaction.reply({ content: `${emojis.WARN} Anti-Raid protection has been **DISABLED**.`, ephemeral: false });
        } else if (subcommand === "status") {
            const config = await getGuildConfig(guildId);
            const status = config.antiraid_enabled ? "ENABLED" : "DISABLED";
            const embed = new EmbedBuilder()
                .setColor(config.antiraid_enabled ? "#00FF00" : "#FF0000")
                .setTitle(`${emojis.SHIELD} Anti-Raid Status`)
                .setDescription(`Current Status: **${status}**`)
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    },
};
