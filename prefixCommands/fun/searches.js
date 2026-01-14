import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "searches",
    description: "Search commands.",
    permissions: [],
    aliases: ["lyrics", "img", "image", "duckduckgoimage", "tenor", "reverseimage"],
    async execute(message, args) {
        const prefix = ",";
        const cmd = message.content.slice(prefix.length).split(/ +/)[0].toLowerCase();

        const query = args.join(" ");
        if (!query) return message.reply(`${emojis.ERROR} Please provide a search query.`);

        let title = "Search";
        let url = "";

        switch (cmd) {
            case "lyrics":
                title = "Genius Lyrics Search";
                url = `https://genius.com/search?q=${encodeURIComponent(query)}`;
                break;
            case "img":
            case "image":
                title = "Google Images";
                url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
                break;
            case "duckduckgoimage":
                title = "DuckDuckGo Images";
                url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
                break;
            case "tenor":
                title = "Tenor Search";
                url = `https://tenor.com/search/${encodeURIComponent(query)}-gifs`;
                break;
            case "reverseimage":
                title = "Google Reverse Image Search";
                // Requires URL as query
                url = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(query)}`;
                break;
            default:
                return message.reply("Unknown search command.");
        }

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle(title)
            .setDescription(`[Click here to view results for **${query}**](${url})`);

        return message.channel.send({ embeds: [embed] });
    }
};
