import { PermissionsBitField, EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "lock",
    description: "Locks the current channel.",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    botPermissions: [PermissionsBitField.Flags.ManageChannels],
    async execute(message, args) {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: false,
        });

        const embed = new EmbedBuilder()
            .setColor("#FFB6C1")
            .setTitle(`${emojis.LOCK} Channel Locked`)
            .setDescription("This channel has been locked by a moderator.");

        message.channel.send({ embeds: [embed] });
    },
};
