import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "tools",
    description: "Utility tools.",
    permissions: [],
    aliases: ["ocr", "translate", "movie", "tvshow", "wolfram", "wikihow"],
    async execute(message, args) {
        const prefix = ",";
        const cmd = message.content.slice(prefix.length).split(/ +/)[0].toLowerCase();

        const query = args.join(" ");

        // Handling commands that require args (most do)
        if (!query && cmd !== "ocr") return message.reply(`${emojis.ERROR} Please provide query/text.`);

        let title = "Tool";
        let url = "";
        let desc = "";

        switch (cmd) {
            case "ocr":
                // Requires attachment usually
                title = "OCR (Optical Character Recognition)";
                url = "https://ocr.space/";
                desc = "This command requires an API key in this version. Please visit OCR.space to upload your image.";
                break;
            case "translate":
                title = "Google Search Translate";
                url = `https://translate.google.com/?text=${encodeURIComponent(query)}`;
                desc = `[Click to Translate](${url})`;
                break;
            case "movie":
                title = "IMDb Movie Search";
                url = `https://www.imdb.com/find?q=${encodeURIComponent(query)}`;
                desc = `[View Movie Results](${url})`;
                break;
            case "tvshow":
                title = "IMDb TV Search";
                url = `https://www.imdb.com/find?q=${encodeURIComponent(query)}`;
                desc = `[View TV Show Results](${url})`;
                break;
            case "wolfram":
                title = "WolframAlpha";
                url = `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`;
                desc = `[Compute Input](${url})`;
                break;
            case "wikihow":
                title = "wikiHow Search";
                url = `https://www.wikihow.com/wikiHowTo?search=${encodeURIComponent(query)}`;
                desc = `[How to...](${url})`;
                break;
        }

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle(title)
            .setDescription(desc || `[Link](${url})`);

        return message.channel.send({ embeds: [embed] });
    }
};
