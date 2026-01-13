import { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { setGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "tsetup",
    description: "Sets up the ticket system.",
    permissions: [PermissionsBitField.Flags.Administrator],
    async execute(message, args) {
        const channel = message.mentions.channels.first() || message.channel;

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(`${emojis.TICKET} Support Tickets`)
            .setDescription("Click the button below to open a ticket.");

        const button = new ButtonBuilder()
            .setCustomId("create_ticket")
            .setLabel("Open Ticket")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(emojis.TICKET);

        const row = new ActionRowBuilder().addComponents(button);

        await channel.send({ embeds: [embed], components: [row] });
        message.reply(`${emojis.SUCCESS} Ticket panel sent to ${channel}.`);

        // Save ticket category if provided? For now just basic setup.
    },
};
