import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { getEconomy, updateEconomy } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "marry",
    description: "Propose to someone!",
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply("You need to mention someone to marry!");
        if (target.id === message.author.id) return message.reply("You can't marry yourself!");
        if (target.bot) return message.reply("You can't marry a bot!");

        const user = getEconomy(message.author.id);
        const partner = getEconomy(target.id);

        if (user.partner_id) return message.reply("You are already married!");
        if (partner.partner_id) return message.reply("That person is already married!");

        const embed = new EmbedBuilder()
            .setColor("#FFC0CB") // Pink
            .setTitle(`${emojis.HEART} Marriage Proposal`)
            .setDescription(`${target}, **${message.author.username}** has proposed to you! Do you accept?`)
            .setFooter({ text: "You have 30 seconds to respond." });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('accept_marriage').setLabel('I Do!').setStyle(ButtonStyle.Success).setEmoji(emojis.HEART),
                new ButtonBuilder().setCustomId('decline_marriage').setLabel('No...').setStyle(ButtonStyle.Danger).setEmoji('💔')
            );

        const msg = await message.channel.send({ content: `${target}`, embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id !== target.id) {
                return i.reply({ content: "This proposal is not for you!", ephemeral: true });
            }

            if (i.customId === 'accept_marriage') {
                updateEconomy(message.author.id, { partner_id: target.id, marriage_time: Date.now() });
                updateEconomy(target.id, { partner_id: message.author.id, marriage_time: Date.now() });

                const successEmbed = new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle(`${emojis.ANNOUNCE} Just Married! ${emojis.ANNOUNCE}`)
                    .setDescription(`**${message.author.username}** and **${target.username}** are now married! ${emojis.HEART} ${emojis.COUPLE}`)
                    .setImage("https://media.tenor.com/2j2j2j2j2j2j/anime-wedding.gif"); // Placeholder GIF

                await i.update({ embeds: [successEmbed], components: [] });
            } else {
                await i.update({ content: "Proposal declined. 💔", embeds: [], components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                msg.edit({ content: "Proposal timed out.", components: [] });
            }
        });
    },
};
