import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "spotify",
    description: "Spotify integration.",
    permissions: [],
    aliases: ["sp"],
    async execute(message, args) {
        const action = args[0];

        if (action === "play") {
            const song = args.slice(1).join(" ");
            if (!song) return message.reply(`${emojis.ERROR} Provide a song name.`);

            const embed = new EmbedBuilder()
                .setColor("#1DB954")
                .setTitle("Now Playing")
                .setDescription(`🎵 **${song}**`)
                .setFooter({ text: "Spotify", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png" });

            return message.channel.send({ embeds: [embed] });
        } else {
            return message.reply(`${emojis.ERROR} Usage: ,spotify play [song]`);
        }
    },
};
