import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { getEconomy, updateEconomy } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "adopt",
    description: "Adopt a child!",
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply("You need to mention someone to adopt!");
        if (target.id === message.author.id) return message.reply("You can't adopt yourself!");
        if (target.bot) return message.reply("You can't adopt a bot!");

        const parent = getEconomy(message.author.id);
        const child = getEconomy(target.id);

        if (child.parent_id) return message.reply("This user already has a parent!");

        // Check if child is actually the parent of the user (prevent loops)
        if (parent.parent_id === target.id) return message.reply("You can't adopt your own parent!");

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(`${emojis.USERS} Adoption Proposal`)
            .setDescription(`${target}, **${message.author.username}** wants to adopt you! Do you accept?`)
            .setFooter({ text: "You have 30 seconds to respond." });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('accept_adopt').setLabel('Yes! 🥺').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('decline_adopt').setLabel('No thanks').setStyle(ButtonStyle.Secondary)
            );

        const msg = await message.channel.send({ content: `${target}`, embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id !== target.id) {
                return i.reply({ content: "This proposal is not for you!", ephemeral: true });
            }

            if (i.customId === 'accept_adopt') {
                // Update Child
                updateEconomy(target.id, { parent_id: message.author.id });

                // Update Parent
                const currentChildren = JSON.parse(parent.children || '[]');
                if (!currentChildren.includes(target.id)) {
                    currentChildren.push(target.id);
                    updateEconomy(message.author.id, { children: JSON.stringify(currentChildren) });
                }

                const successEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(`${emojis.ANNOUNCE} Adoption Successful! ${emojis.ANNOUNCE}`)
                    .setDescription(`**${message.author.username}** has adopted **${target.username}**! ${emojis.USERS}`);

                await i.update({ embeds: [successEmbed], components: [] });
            } else {
                await i.update({ content: "Adoption declined.", embeds: [], components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                msg.edit({ content: "Adoption timed out.", components: [] });
            }
        });
    },
};
