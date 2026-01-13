import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "games",
    description: "Play mini-games.",
    permissions: [],
    aliases: [],
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor("#FF00FF")
            .setTitle(`${emojis.DICE} Mini-Games`)
            .setDescription("Select a game to play:")
            .addFields(
                { name: "Tic Tac Toe", value: "Classic 3x3 game.", inline: true },
                { name: "Rock Paper Scissors", value: "Test your luck.", inline: true },
                { name: "Minesweeper", value: "Find the mines.", inline: true }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('game_ttt').setLabel('Tic Tac Toe').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('game_rps').setLabel('Rock Paper Scissors').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('game_mine').setLabel('Minesweeper').setStyle(ButtonStyle.Danger)
            );

        message.channel.send({ embeds: [embed], components: [row] });
    },
};
