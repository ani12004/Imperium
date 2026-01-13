import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

const actions = {
    hug: ["https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif", "https://media.giphy.com/media/3bqtLDeiDtwhq/giphy.gif"],
    kiss: ["https://media.giphy.com/media/FqBTvSNjNzeZG/giphy.gif", "https://media.giphy.com/media/nyGFcsP0kAobm/giphy.gif"],
    slap: ["https://media.giphy.com/media/Gf3AUz3eBNbWM/giphy.gif", "https://media.giphy.com/media/10Am8idu3qBYRy/giphy.gif"],
    pat: ["https://media.giphy.com/media/5tmRHwTlHAA9WkVxTU/giphy.gif", "https://media.giphy.com/media/L2z7dnOduqE6Y/giphy.gif"],
    kill: ["https://media.giphy.com/media/G3ViWp5HnFQwRj2hD/giphy.gif", "https://media.giphy.com/media/EtB1yylKGGAUg/giphy.gif"]
};

export default {
    name: "roleplay",
    description: "Roleplay actions.",
    permissions: [],
    aliases: ["rp"],
    async execute(message, args) {
        let action = args[0]?.toLowerCase();

        if (!actions[action]) return message.reply(`${emojis.ERROR} Available actions: hug, kiss, slap, pat, kill.`);

        const target = message.mentions.members.first();
        if (!target) return message.reply(`${emojis.ERROR} You need to mention someone to ${action}!`);

        const gifs = actions[action];
        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor("#FF69B4")
            .setDescription(`**${message.author.username}** ${action}s **${target.user.username}**!`)
            .setImage(gif);

        message.channel.send({ embeds: [embed] });
    },
};
