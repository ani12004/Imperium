import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

export default {
    name: "profiles",
    description: "Get links to user profiles.",
    permissions: [],
    aliases: ["steam", "roblox", "xbox", "psn", "twitter", "instagram", "twitch", "youtube", "spotify", "cashapp", "snapchat"],
    async execute(message, args) {
        // Detect aliased command usage
        const prefix = ","; // Ideally fetched from config but defaulting for speed
        const cmd = message.content.slice(prefix.length).split(/ +/)[0].toLowerCase();

        const username = args.join(" ");
        if (!username) return message.reply(`${emojis.ERROR} Please provide a username/gamertag.`);

        let title = "Profile";
        let url = "";
        let color = "#2b2d31";

        switch (cmd) {
            case "steam":
                title = "Steam Profile";
                url = `https://steamcommunity.com/id/${encodeURIComponent(username)}`;
                color = "#171a21";
                break;
            case "roblox":
                title = "Roblox Profile";
                // Roblox search isn't direclty by username in URL for 'users', usually id. 
                // But valid search: https://www.roblox.com/search/users?keyword=
                url = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}`;
                color = "#c90000";
                break;
            case "xbox":
                title = "Xbox Profile";
                url = `https://xboxgamertag.com/search/${encodeURIComponent(username)}`;
                color = "#107c10";
                break;
            case "psn":
                title = "PSN Profile";
                url = `https://psnprofiles.com/${encodeURIComponent(username)}`;
                color = "#003791";
                break;
            case "twitter":
                title = "Twitter Profile";
                url = `https://twitter.com/${encodeURIComponent(username)}`;
                color = "#1da1f2";
                break;
            case "instagram":
                title = "Instagram Profile";
                url = `https://instagram.com/${encodeURIComponent(username)}`;
                color = "#e1306c";
                break;
            case "twitch":
                title = "Twitch Channel";
                url = `https://twitch.tv/${encodeURIComponent(username)}`;
                color = "#6441a5";
                break;
            case "youtube":
                title = "YouTube Channel";
                url = `https://youtube.com/@${encodeURIComponent(username)}`;
                color = "#ff0000";
                break;
            case "spotify":
                title = "Spotify Search";
                url = `https://open.spotify.com/search/${encodeURIComponent(username)}`;
                color = "#1db954";
                break;
            case "cashapp":
                title = "CashApp";
                url = `https://cash.app/$${encodeURIComponent(username)}`;
                color = "#00d632";
                break;
            case "snapchat":
                title = "Snapchat";
                url = `https://www.snapchat.com/add/${encodeURIComponent(username)}`;
                color = "#fffc00";
                break;
            default:
                return message.reply("Unknown profile command.");
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(`[Click here to view **${username}**'s profile](${url})`)
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
};
