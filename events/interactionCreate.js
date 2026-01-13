import { Events, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } from 'discord.js';
import db from '../utils/database.js';
import emojis from '../utils/emojis.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
      return;
    }

    // Handle Buttons
    if (interaction.isButton()) {
      const { customId, guild, user } = interaction;

      // --- Create Ticket ---
      // --- Create Ticket ---
      if (customId === 'create_ticket') {
        // Check if user already has an open ticket
        const { data: existingTicket } = await db
          .from('tickets')
          .select('*')
          .match({ user_id: user.id, guild_id: guild.id, closed: 0 })
          .single();

        if (existingTicket) {
          // Check if channel still exists
          const channel = guild.channels.cache.get(existingTicket.channel_id);
          if (channel) {
            return interaction.reply({ content: `You already have an open ticket: ${channel}`, ephemeral: true });
          } else {
            // Clean up ghost ticket from DB if channel was manually deleted
            await db.from('tickets').update({ closed: 1 }).eq('ticket_id', existingTicket.ticket_id);
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
          await db.from('tickets').insert({
            ticket_id: ticketId,
            guild_id: guild.id,
            user_id: user.id,
            channel_id: channel.id
          });

          // Send Welcome Message
          const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`Ticket for ${user.username}`)
            .setDescription('Support will be with you shortly.\nClick the button below to close this ticket.');

          const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji(emojis.LOCK);

          const row = new ActionRowBuilder().addComponents(closeButton);

          await channel.send({ content: `${user}`, embeds: [embed], components: [row] });

          await interaction.reply({ content: `${emojis.SUCCESS} Ticket created: ${channel}`, ephemeral: true });

        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'Failed to create ticket channel. Check my permissions!', ephemeral: true });
        }
        return;
      }

      // --- Close Ticket ---
      if (customId === 'close_ticket') {
        // Check if it is a ticket channel
        const { data: ticket } = await db
          .from('tickets')
          .select('*')
          .eq('channel_id', interaction.channelId)
          .single();

        if (!ticket) {
          return interaction.reply({ content: 'This is not a valid ticket channel or it is not in the database.', ephemeral: true });
        }

        await interaction.reply(`${emojis.LOCK} Closing ticket in 5 seconds...`);

        // Update DB
        await db.from('tickets').update({ closed: 1 }).eq('ticket_id', ticket.ticket_id);

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
        } else if (value === 'ticket_setup') {
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder().setCustomId('send_ticket_panel').setLabel('Send Panel Here').setStyle(ButtonStyle.Success).setEmoji(emojis.TICKET)
            );
          await interaction.reply({ content: 'Click below to send the Ticket Panel to this channel:', components: [row], ephemeral: true });

        } else if (value === 'leveling_setup') {
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder().setCustomId('set_leveling_channel').setLabel('Set Leveling Channel').setStyle(ButtonStyle.Primary).setEmoji('#️⃣')
            );
          await interaction.reply({ content: 'Configure Leveling Settings:', components: [row], ephemeral: true });

        } else if (value === 'general_setup') {
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder().setCustomId('set_prefix_btn').setLabel('Set Prefix').setStyle(ButtonStyle.Secondary).setEmoji('❗')
            );
          await interaction.reply({ content: 'Configure General Settings:', components: [row], ephemeral: true });
        }
      }

      if (interaction.customId === 'setup_menu') {
        const template = interaction.values[0];
        await interaction.reply({ content: `🛠️ Setting up **${template}** server...`, ephemeral: true });

        const guild = interaction.guild;

        try {
          if (template === 'gaming') {
            await guild.channels.create({ name: '🎮-general', type: ChannelType.GuildText });
            await guild.channels.create({ name: '🎮-clips', type: ChannelType.GuildText });
            await guild.channels.create({ name: '🔊-lobby', type: ChannelType.GuildVoice });
            await guild.channels.create({ name: '🔊-gaming', type: ChannelType.GuildVoice });
          } else if (template === 'community') {
            await guild.channels.create({ name: '💬-chat', type: ChannelType.GuildText });
            await guild.channels.create({ name: '📷-media', type: ChannelType.GuildText });
            await guild.channels.create({ name: '📢-announcements', type: ChannelType.GuildText });
            await guild.channels.create({ name: '🔊-voice', type: ChannelType.GuildVoice });
          } else if (template === 'private') {
            await guild.channels.create({
              name: '🔒-secret-chat',
              type: ChannelType.GuildText,
              permissionOverwrites: [{ id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }]
            });
            await guild.channels.create({
              name: '🔊-secret-voice',
              type: ChannelType.GuildVoice,
              permissionOverwrites: [{ id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }]
            });
          }

          await interaction.followUp({ content: `✅ **${template}** server setup complete!`, ephemeral: true });
        } catch (error) {
          console.error(error);
          await interaction.followUp({ content: `${emojis.ERROR} Failed to create channels. Check my permissions!`, ephemeral: true });
        }
      }
      return;
    }

    // Handle Channel Selects (Consolidated below)

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
        const select = new ChannelSelectMenuBuilder()
          .setCustomId('embed_channel_select')
          .setPlaceholder('Select where to send the embed')
          .setChannelTypes(ChannelType.GuildText);

        const row = new ActionRowBuilder().addComponents(select);
        await interaction.reply({ content: 'First, choose the channel:', components: [row], ephemeral: true });
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

      if (customId === 'manage_economy_btn') {
        if (interaction.user.id !== '1157205021008609311') {
          return interaction.reply({ content: '❌ Access Denied.', ephemeral: true });
        }

        const modal = new ModalBuilder()
          .setCustomId('economy_modal')
          .setTitle('Manage Economy');

        const userInput = new TextInputBuilder().setCustomId('eco_user').setLabel("User ID").setStyle(TextInputStyle.Short).setRequired(true);
        const actionInput = new TextInputBuilder().setCustomId('eco_action').setLabel("Action (add/remove/set)").setStyle(TextInputStyle.Short).setPlaceholder("add").setRequired(true);
        const amountInput = new TextInputBuilder().setCustomId('eco_amount').setLabel("Amount").setStyle(TextInputStyle.Short).setPlaceholder("1000").setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(userInput),
          new ActionRowBuilder().addComponents(actionInput),
          new ActionRowBuilder().addComponents(amountInput)
        );
        await interaction.showModal(modal);
        return;
      }

      if (customId === 'accept_rules_btn') {
        const { updateEconomy } = await import('../utils/database.js');
        updateEconomy(interaction.user.id, { rules_accepted: 1 });

        await interaction.reply({ content: `${emojis.SUCCESS} **Rules Accepted!** You can now use economy commands.`, ephemeral: true });

        // Disable the button on the original message
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('accept_rules_btn').setLabel('Rules Accepted').setStyle(ButtonStyle.Success).setEmoji(emojis.SUCCESS).setDisabled(true)
        );
        await interaction.message.edit({ components: [disabledRow] });
        return;
      }

      // --- New Config Handlers ---
      if (customId === 'send_ticket_panel') {
        const embed = new EmbedBuilder()
          .setColor('Blue')
          .setTitle('🎫 Support Tickets')
          .setDescription('Click the button below to open a support ticket.')
          .setFooter({ text: 'Support System' });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('create_ticket').setLabel('Create Ticket').setStyle(ButtonStyle.Primary).setEmoji(emojis.TICKET)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `${emojis.SUCCESS} Ticket panel sent!`, ephemeral: true });
        return;
      }

      if (customId === 'set_leveling_channel') {
        const select = new ChannelSelectMenuBuilder()
          .setCustomId('leveling_channel_select')
          .setPlaceholder('Select leveling channel')
          .setChannelTypes(ChannelType.GuildText);

        const row = new ActionRowBuilder().addComponents(select);
        await interaction.reply({ content: 'Select where level-up messages should go:', components: [row], ephemeral: true });
        return;
      }

      if (customId === 'set_prefix_btn') {
        const modal = new ModalBuilder()
          .setCustomId('prefix_modal')
          .setTitle('Set Server Prefix');

        const input = new TextInputBuilder()
          .setCustomId('prefix_input')
          .setLabel("New Prefix")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("s?")
          .setRequired(true)
          .setMaxLength(5);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
        return;
      }

      // --- VoiceMaster Buttons ---
      if (customId.startsWith('vm_')) {
        const { getGuildConfig } = await import('../utils/database.js');
        const config = await getGuildConfig(interaction.guildId);
        const voiceChannel = interaction.member.voice.channel;

        if (!config.voicemaster_category) return interaction.reply({ content: "❌ VoiceMaster is not configured.", ephemeral: true });

        if (!voiceChannel || voiceChannel.parentId !== config.voicemaster_category) {
          return interaction.reply({ content: "❌ You must be in a VoiceMaster channel to use this.", ephemeral: true });
        }

        // Check Ownership
        const isOwner = voiceChannel.permissionsFor(interaction.member).has(PermissionsBitField.Flags.ManageChannels);

        // Handle Claim separately as it doesn't require being owner initially
        if (customId === 'vm_claim') {
          const ownerOverwrite = voiceChannel.permissionOverwrites.cache.find(perm => perm.type === 1 && perm.allow.has(PermissionsBitField.Flags.ManageChannels));
          const currentOwnerId = ownerOverwrite ? ownerOverwrite.id : null;

          if (currentOwnerId === interaction.member.id) return interaction.reply({ content: "⚠️ You already own this channel.", ephemeral: true });
          if (currentOwnerId && voiceChannel.members.has(currentOwnerId)) return interaction.reply({ content: "❌ The owner is still here.", ephemeral: true });

          await voiceChannel.permissionOverwrites.delete(currentOwnerId).catch(() => { });
          await voiceChannel.permissionOverwrites.edit(interaction.member, { ManageChannels: true, Connect: true });
          return interaction.reply({ content: "✅ You claimed the channel!", ephemeral: true });
        }

        if (!isOwner) return interaction.reply({ content: "❌ You do not own this channel.", ephemeral: true });

        switch (customId) {
          case 'vm_lock':
            await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
            return interaction.reply({ content: "🔒 Channel locked.", ephemeral: true });
          case 'vm_unlock':
            await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: true });
            return interaction.reply({ content: "🔓 Channel unlocked.", ephemeral: true });
          case 'vm_hide':
            await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false });
            return interaction.reply({ content: "👁️ Channel hidden.", ephemeral: true });
          case 'vm_unhide':
            await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: true });
            return interaction.reply({ content: "👀 Channel visible.", ephemeral: true });
          case 'vm_permit':
          case 'vm_reject':
            return interaction.reply({ content: "⚠️ Please use the command for this: `.vm permit @user` or `.vm reject @user`", ephemeral: true });
        }
      }
    }

    // Handle Channel Selects
    if (interaction.isChannelSelectMenu()) {
      const { setGuildConfig } = await import('../utils/database.js');

      if (interaction.customId === 'welcome_channel_select') {
        const channelId = interaction.values[0];
        setGuildConfig(interaction.guildId, 'welcome_channel', channelId);
        await interaction.reply({ content: `${emojis.SUCCESS} Welcome channel set to <#${channelId}>!`, ephemeral: true });
        return;
      }

      if (interaction.customId === 'leveling_channel_select') {
        try {
          const channelId = interaction.values[0];
          setGuildConfig(interaction.guildId, 'level_channel', channelId);
          await interaction.reply({ content: `✅ Leveling channel set to <#${channelId}>!`, ephemeral: true });
        } catch (error) {
          console.error("Leveling setup error:", error);
          await interaction.reply({ content: `❌ Failed to set channel: ${error.message}`, ephemeral: true });
        }
        return;
      }

      if (interaction.customId === 'embed_channel_select') {
        const channelId = interaction.values[0];

        // Show the modal now, passing channelId in the customId
        const modal = new ModalBuilder()
          .setCustomId(`embed_modal_${channelId}`)
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
    }

    // Handle Modals
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'prefix_modal') {
        const newPrefix = interaction.fields.getTextInputValue('prefix_input');
        const { setGuildConfig } = await import('../utils/database.js');
        setGuildConfig(interaction.guildId, 'prefix', newPrefix);
        await interaction.reply({ content: `${emojis.SUCCESS} Server prefix updated to: \`${newPrefix}\``, ephemeral: true });
        return;
      }
      if (interaction.customId === 'welcome_message_modal') {
        const message = interaction.fields.getTextInputValue('welcome_message_input');
        // Save to DB
        const { setGuildConfig } = await import('../utils/database.js');
        setGuildConfig(interaction.guildId, 'welcome_message', message);
        await interaction.reply({ content: '✅ Welcome message updated!', ephemeral: true });
      }

      if (interaction.customId.startsWith('embed_modal')) {
        // Extract channel ID from customId "embed_modal_CHANNELID"
        const channelId = interaction.customId.split('_')[2];

        const title = interaction.fields.getTextInputValue('embed_title');
        const description = interaction.fields.getTextInputValue('embed_desc');
        const color = interaction.fields.getTextInputValue('embed_color') || '#FFB6C1';
        const footer = interaction.fields.getTextInputValue('embed_footer');

        const embed = new EmbedBuilder()
          .setColor(color)
          .setDescription(description);

        if (title) embed.setTitle(title);
        if (footer) embed.setFooter({ text: footer });

        const channel = interaction.guild.channels.cache.get(channelId);
        if (channel) {
          await channel.send({ embeds: [embed] });
          await interaction.reply({ content: `✅ Embed sent to ${channel}!`, ephemeral: true });
        } else {
          await interaction.reply({ content: `❌ Could not find channel.`, ephemeral: true });
        }
      }

      if (interaction.customId === 'economy_modal') {
        const targetId = interaction.fields.getTextInputValue('eco_user');
        const action = interaction.fields.getTextInputValue('eco_action').toLowerCase();
        const amount = parseInt(interaction.fields.getTextInputValue('eco_amount'));

        if (isNaN(amount)) {
          return interaction.reply({ content: '❌ Invalid amount.', ephemeral: true });
        }

        const { getEconomy, updateEconomy } = await import('../utils/database.js');
        const targetUser = await client.users.fetch(targetId).catch(() => null);

        if (!targetUser) {
          return interaction.reply({ content: '❌ User not found.', ephemeral: true });
        }

        const userData = getEconomy(targetId);
        let newBalance = userData.balance;

        if (action === 'add') {
          newBalance += amount;
        } else if (action === 'remove') {
          newBalance -= amount;
        } else if (action === 'set') {
          newBalance = amount;
        } else {
          return interaction.reply({ content: '❌ Invalid action. Use `add`, `remove`, or `set`.', ephemeral: true });
        }

        updateEconomy(targetId, { balance: newBalance });

        const embed = new EmbedBuilder()
          .setColor("Gold")
          .setTitle("💰 Balance Updated")
          .setDescription(`Successfully updated balance for ${targetUser}.`)
          .addFields(
            { name: "Action", value: action.toUpperCase(), inline: true },
            { name: "Amount", value: `${amount}`, inline: true },
            { name: "New Balance", value: `${newBalance}`, inline: true }
          );

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
