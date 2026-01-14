import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ButtonBuilder, ButtonStyle } from "discord.js";
import { getGuildConfig } from "../../utils/database.js";
import emojis from "../../utils/emojis.js";
import { loadCommandList } from "../../utils/commandListLoader.js";

export default {
  name: "help",
  description: "Displays a list of available commands via an interactive menu.",
  aliases: ["h", "commands", "menu"],
  async execute(message, args, client) {
    const config = await getGuildConfig(message.guild.id);
    const prefix = config.prefix || ",";

    // 1. Load commands from text file
    const categories = loadCommandList();
    const sortedCategories = [...categories.keys()];

    // 2. Create the Select Menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('Select a category to view commands')
      .addOptions(
        sortedCategories.map(cat =>
          new StringSelectMenuOptionBuilder()
            .setLabel(cat)
            .setValue(cat)
            .setEmoji(parseEmoji(getCategoryEmoji(cat)))
            .setDescription(`View ${categories.get(cat).length} commands`)
        )
      );

    // 3. Create Home Embed
    const homeEmbed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle(`Imperium Command Directory`)
      .setDescription(`Hello **${message.author.username}**! \n\nI am **Imperium**, an advanced multipurpose bot. Use the menu below to explore my commands.\n\n**Info:**\n> **Prefix:** \`${prefix}\`\n> **Total Commands:** \`${[...categories.values()].flat().length}\`\n> **Categories:** \`${sortedCategories.length}\`\n> **Website:** [Imperium](https://imperiumgg.netlify.app/)`)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ text: "Use the dropdown below to browse categories", iconURL: message.guild.iconURL() });

    // Add Support Button
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.gg/tN5MvnTTXK"),
        new ButtonBuilder()
          .setLabel("Website")
          .setStyle(ButtonStyle.Link)
          .setURL("https://imperiumgg.netlify.app/")
      );

    const menuRow = new ActionRowBuilder().addComponents(selectMenu);

    const initialMessage = await message.channel.send({
      embeds: [homeEmbed],
      components: [menuRow, buttonRow]
    });

    // 4. Collector
    const collector = initialMessage.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000 * 5 // 5 minutes
    });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: `❌ Only ${message.author} can use this menu.`, ephemeral: true });
      }

      const selectedCategory = interaction.values[0];
      const commands = categories.get(selectedCategory);

      // Format commands list - Simple list of names since description might make it too long for one embed field if many commands
      // Or we can try `**name**: description` but limit it.
      // Let's go with just names for density, or `**name** - description` if space allows.
      // The user wants "sub commands as well", so the list is long.
      // 800+ commands won't fit if we do full descriptions in one page per category.
      // Let's start with just names, comma separated or small code blocks.
      // "Server Commands" has 300+ commands? Discord embed limit is 4096 chars.
      // 300 * 15 chars avg = 4500. Might be tight.

      // Let's try to fit them in Description formatted nicely.
      // Use chunks if needed? For now, let's just join them.

      const commandList = commands.map(cmd => `\`${cmd.name}\``).join(", ");

      // Handle too long descriptions
      let description = `**Prefix:** \`${prefix}\`\n\n${commandList}`;
      if (description.length > 4096) {
        description = description.substring(0, 4093) + "...";
      }

      const categoryEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`${getCategoryEmoji(selectedCategory)} ${selectedCategory}`)
        .setDescription(description)
        .setFooter({ text: `Page ${sortedCategories.indexOf(selectedCategory) + 1}/${sortedCategories.length}`, iconURL: client.user.displayAvatarURL() });

      await interaction.update({ embeds: [categoryEmbed] });
    });

    collector.on('end', () => {
      // Disable components on timeout
      const disabledMenu = StringSelectMenuBuilder.from(selectMenu).setDisabled(true);
      const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);
      initialMessage.edit({ components: [disabledRow, buttonRow] }).catch(() => { });
    });
  },
};

function getCategoryEmoji(category) {
  // Normalize category for matching
  const cat = category.toLowerCase();

  // Match text file headers
  if (cat.includes("server")) return emojis.SETTINGS || "⚙️";
  if (cat.includes("moderation")) return emojis.SHIELD || "🛡️";
  if (cat.includes("information")) return emojis.INFO || "ℹ️";
  if (cat.includes("roleplay")) return emojis.HEART || "🎭";
  if (cat.includes("miscellaneous")) return emojis.STAR || "✨";
  if (cat.includes("fun")) return emojis.DICE || "🎲";
  if (cat.includes("manipulation")) return emojis.IMAGE || "🖼️";
  if (cat.includes("voicemaster")) return emojis.MIC || "🎤";
  if (cat.includes("music")) return emojis.MUSIC || "🎵";
  if (cat.includes("levels")) return emojis.TROPHY || "📈";

  return emojis.STAR || "✨";
}

function parseEmoji(emoji) {
  if (!emoji) return null;
  const custom = emoji.match(/<a?:.+:(\d+)>/);
  return custom ? custom[1] : emoji;
}
