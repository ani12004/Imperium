import { PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } from "discord.js";

export default {
    name: "config",
    description: "Configure server settings (Welcome, Leveling, etc.)",
    permissions: [PermissionsBitField.Flags.Administrator],
    async execute(message, args) {
        const select = new StringSelectMenuBuilder()
            .setCustomId("config_menu")
            .setPlaceholder("Select a category to configure")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Welcome Setup")
                    .setDescription("Configure welcome channel and message")
                    .setEmoji("👋")
                    .setValue("welcome_setup"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Ticket Setup")
                    .setDescription("Configure support ticket panel")
                    .setEmoji("🎫")
                    .setValue("ticket_setup"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Leveling Setup")
                    .setDescription("Configure leveling channel")
                    .setEmoji("🆙")
                    .setValue("leveling_setup"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("General Setup")
                    .setDescription("Configure prefix and other settings")
                    .setEmoji("⚙️")
                    .setValue("general_setup")
            );

        const row = new ActionRowBuilder().addComponents(select);

        const embed = new EmbedBuilder()
            .setColor("#FFB6C1")
            .setTitle("⚙️ Server Configuration")
            .setDescription("Please select a category below to configure your server settings.")
            .setFooter({ text: "Snowfall Promotions & Nitro Giveaways Style" });

        message.channel.send({ embeds: [embed], components: [row] });
    },
};
