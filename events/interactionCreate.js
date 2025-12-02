import { Events, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Handle Buttons
    if (interaction.isButton()) {
      const { customId, guild, user } = interaction;

      // --- Create Ticket ---
      if (customId === 'create_ticket') {
        // Check if user already has an open ticket
        const existingTicket = db.prepare('SELECT * FROM tickets WHERE user_id = ? AND guild_id = ? AND closed = 0').get(user.id, guild.id);

        if (existingTicket) {
          // Check if channel still exists
          const channel = guild.channels.cache.get(existingTicket.channel_id);
          if (channel) {
            return interaction.reply({ content: `You already have an open ticket: ${channel}`, ephemeral: true });
          } else {
            // Clean up ghost ticket from DB if channel was manually deleted
            db.prepare('UPDATE tickets SET closed = 1 WHERE ticket_id = ?').run(existingTicket.ticket_id);
          }
        }

        try {
          // Create Channel
          const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
              },
              {
                id: user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
              },
              {
                id: client.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
              }
            ],
          });

          // Add to DB
          const ticketId = `${guild.id}-${user.id}-${Date.now()}`;
          db.prepare('INSERT INTO tickets (ticket_id, guild_id, user_id, channel_id) VALUES (?, ?, ?, ?)').run(ticketId, guild.id, user.id, channel.id);

          // Send Welcome Message
          const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`Ticket for ${user.username}`)
            .setDescription('Support will be with you shortly.\nClick the button below to close this ticket.');

          const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒');

          const row = new ActionRowBuilder().addComponents(closeButton);

          await channel.send({ content: `${user}`, embeds: [embed], components: [row] });

          await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });

        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'Failed to create ticket channel. Check my permissions!', ephemeral: true });
        }
        return;
      }

      // --- Close Ticket ---
      if (customId === 'close_ticket') {
        // Check if it is a ticket channel
        const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channelId);
        if (!ticket) {
          return interaction.reply({ content: 'This is not a valid ticket channel or it is not in the database.', ephemeral: true });
        }

        await interaction.reply('🔒 Closing ticket in 5 seconds...');

        // Update DB
        db.prepare('UPDATE tickets SET closed = 1 WHERE ticket_id = ?').run(ticket.ticket_id);

        setTimeout(() => {
          interaction.channel.delete().catch(() => { });
        }, 5000);
        return;
      }
    }

    // Handle Select Menus
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'config_menu') {
        const value = interaction.values[0];

        if (value === 'welcome_setup') {
          // Show options to set channel or message
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder().setCustomId('set_welcome_channel').setLabel('Set Channel').setStyle(ButtonStyle.Primary),
              new ButtonBuilder().setCustomId('set_welcome_message').setLabel('Set Message').setStyle(ButtonStyle.Secondary)
            );
          await interaction.reply({ content: 'Configure Welcome Settings:', components: [row], ephemeral: true });
        } else if (value === 'leveling_setup') {
          await interaction.reply({ content: 'Leveling setup coming soon!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'General setup coming soon!', ephemeral: true });
        }
      }
      return;
    }

    if (interaction.isChannelSelectMenu()) {
      if (interaction.customId === 'welcome_channel_select') {
        const channelId = interaction.values[0];
        // Save to DB
        const { setGuildConfig } = await import('../utils/database.js');
        setGuildConfig(interaction.guildId, 'welcome_channel', channelId);
        await interaction.reply({ content: `✅ Welcome channel set to <#${channelId}>!`, ephemeral: true });
      }
      return;
    }

    // Handle Buttons (Config & Say)
    if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === 'set_welcome_message') {
        const modal = new ModalBuilder()
          .setCustomId('welcome_message_modal')
          .setTitle('Edit Welcome Message');

        const messageInput = new TextInputBuilder()
          .setCustomId('welcome_message_input')
          .setLabel("Welcome Message")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("Hello {member}, welcome to {server}!")
          .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(firstActionRow);
        await interaction.showModal(modal);
        return;
      }

      if (customId === 'create_embed_button') {
        const modal = new ModalBuilder()
          .setCustomId('embed_modal')
          .setTitle('Create Aesthetic Embed');

        const titleInput = new TextInputBuilder().setCustomId('embed_title').setLabel("Title").setStyle(TextInputStyle.Short).setRequired(false);
        const descInput = new TextInputBuilder().setCustomId('embed_desc').setLabel("Description").setStyle(TextInputStyle.Paragraph).setRequired(true);
        const colorInput = new TextInputBuilder().setCustomId('embed_color').setLabel("Color (Hex)").setStyle(TextInputStyle.Short).setPlaceholder("#FFB6C1").setRequired(false);
        const footerInput = new TextInputBuilder().setCustomId('embed_footer').setLabel("Footer").setStyle(TextInputStyle.Short).setRequired(false);

        modal.addComponents(
          new ActionRowBuilder().addComponents(titleInput),
          new ActionRowBuilder().addComponents(descInput),
          new ActionRowBuilder().addComponents(colorInput),
          new ActionRowBuilder().addComponents(footerInput)
        );
        await interaction.showModal(modal);
        return;
      }

      if (customId === 'set_welcome_channel') {
        const select = new ChannelSelectMenuBuilder()
          .setCustomId('welcome_channel_select')
          .setPlaceholder('Select a channel')
          .setChannelTypes(ChannelType.GuildText);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({ content: 'Select the channel for welcome messages:', components: [row], ephemeral: true });
        return;
      }
    }

    // Handle Modals
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'welcome_message_modal') {
        const message = interaction.fields.getTextInputValue('welcome_message_input');
        // Save to DB
        const { setGuildConfig } = await import('../utils/database.js');
        setGuildConfig(interaction.guildId, 'welcome_message', message);
        await interaction.reply({ content: '✅ Welcome message updated!', ephemeral: true });
      }

      if (interaction.customId === 'embed_modal') {
        const title = interaction.fields.getTextInputValue('embed_title');
        const description = interaction.fields.getTextInputValue('embed_desc');
        const color = interaction.fields.getTextInputValue('embed_color') || '#FFB6C1';
        const footer = interaction.fields.getTextInputValue('embed_footer');

        const embed = new EmbedBuilder()
          .setColor(color)
          .setDescription(description);

        if (title) embed.setTitle(title);
        if (footer) embed.setFooter({ text: footer });

        await interaction.reply({ embeds: [embed] });
      }
    }
  },
};
