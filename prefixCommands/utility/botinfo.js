import { EmbedBuilder, version } from "discord.js";
import os from "os";

export default {
    name: "botinfo",
    description: "Displays information about the bot.",
    aliases: ["bi", "stats"],
    async execute(message, args, client) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setColor("#FFB6C1")
            .setTitle("🤖 Bot Information")
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: "Name", value: client.user.tag, inline: true },
                { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
                { name: "Users", value: `${client.users.cache.size}`, inline: true },
                { name: "Uptime", value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: "Library", value: `Discord.js v${version}`, inline: true },
                { name: "Node.js", value: process.version, inline: true },
                { name: "Memory Usage", value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: "Support Server", value: "[Join Here](https://discord.gg/tN5MvnTTXK)", inline: true }
            )
            .setFooter({ text: "Imperium" });

        message.channel.send({ embeds: [embed] });
    },
};
