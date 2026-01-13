import { EmbedBuilder } from "discord.js";
import emojis from "../../utils/emojis.js";

// Mock GIF APIs (replace with real API calls or more extensive arrays in production)
const getRandomGif = (action) => {
    // In a real bot, you'd fetch from Tenor/Giphy or use a large JSON list.
    // For this implementation, returning a placeholder URL to represent the thought.
    return "https://media.giphy.com/media/dummyURL/giphy.gif";
};

// Map of action -> { description template, aliases }
const actions = {
    airkiss: { text: "airkissed", aliases: [] },
    angrystare: { text: "is staring angrily at", aliases: [] },
    bite: { text: "bit", aliases: [] },
    bleh: { text: "went bleh at", aliases: [] },
    brofist: { text: "brofisted", aliases: [] },
    celebrate: { text: "is celebrating with", aliases: [] },
    cheers: { text: "cheers with", aliases: [] },
    clap: { text: "is clapping for", aliases: [] },
    confused: { text: "is confused by", aliases: [] },
    cool: { text: "acts cool with", aliases: [] },
    cry: { text: "is crying at", aliases: [] },
    cuddle: { text: "cuddled", aliases: [] },
    dance: { text: "is dancing with", aliases: [] },
    drool: { text: "is drooling over", aliases: [] },
    evillaugh: { text: "is laughing evilly at", aliases: [] },
    facepalm: { text: "facepalmed at", aliases: [] },
    handhold: { text: "is holding hands with", aliases: [] },
    happy: { text: "is happy with", aliases: [] },
    headbang: { text: "is headbanging with", aliases: [] },
    hug: { text: "hugged", aliases: [] },
    kiss: { text: "kissed", aliases: [] },
    laugh: { text: "laughed with", aliases: [] },
    lick: { text: "licked", aliases: [] },
    love: { text: "loves", aliases: [] },
    mad: { text: "is mad at", aliases: [] },
    nervous: { text: "is nervous around", aliases: [] },
    nom: { text: "nommed on", aliases: [] },
    nuzzle: { text: "nuzzled", aliases: [] },
    nyah: { text: "went nyah at", aliases: [] },
    pat: { text: "patted", aliases: [] },
    peek: { text: "is peeking at", aliases: [] },
    pinch: { text: "pinched", aliases: [] },
    poke: { text: "poked", aliases: [] },
    pout: { text: "is pouting at", aliases: [] },
    punch: { text: "punched", aliases: [] },
    sad: { text: "is sad because of", aliases: [] },
    scared: { text: "is scared of", aliases: [] },
    shout: { text: "shouted at", aliases: [] },
    shrug: { text: "shrugged at", aliases: [] },
    shy: { text: "is shy around", aliases: [] },
    sigh: { text: "sighed at", aliases: [] },
    sip: { text: "sipped with", aliases: [] },
    slap: { text: "slapped", aliases: [] },
    sleep: { text: "is sleeping with", aliases: [] },
    slowclap: { text: "slow clapped at", aliases: [] },
    smack: { text: "smacked", aliases: [] },
    smile: { text: "smiled at", aliases: [] },
    smug: { text: "is smug at", aliases: [] },
    sneeze: { text: "sneezed on", aliases: [] },
    sorry: { text: "is sorry to", aliases: [] },
    stare: { text: "is staring at", aliases: [] },
    surprised: { text: "is surprised by", aliases: [] },
    sweat: { text: "is sweating around", aliases: [] },
    thumbsup: { text: "gave a thumbs up to", aliases: [] },
    tickle: { text: "tickled", aliases: [] },
    tired: { text: "is tired around", aliases: [] },
    wave: { text: "waved at", aliases: [] },
    wink: { text: "winked at", aliases: [] },
    woah: { text: "gasped at", aliases: [] },
    yawn: { text: "yawned at", aliases: [] },
    yay: { text: "is excited with", aliases: [] },
    yes: { text: "said yes to", aliases: [] },
    kill: { text: "killed", aliases: ["murder"] }
};

export default {
    name: "roleplay",
    description: "Execute a roleplay action.",
    permissions: [],
    aliases: ["rp", ...Object.keys(actions)], // Make every action an alias! (e.g. ,hug)
    async execute(message, args) {
        // Strategy: 
        // 1. If command is ,roleplay [action] -> use args[0]
        // 2. If command is ,[action] -> use alias map logic (handled by client probably passing 'commandName') 
        // But here we are inside execute. We need to know WHICH alias triggered it if possible.
        // Usually `execute(message, args, commandName)` is the signature if the handler supports it.
        // Assuming the loader passes standard (message, args).

        // HACK: We can't easily distinguish `,hug` vs `,roleplay hug` without extra info or context.
        // However, standard architecture usually implies `aliases` map to the SAME command file.
        // So checking `message.content` or just parsing args is robust enough.

        let actionKey = args[0]?.toLowerCase(); // Default assumption: ,roleplay hug
        let targetStart = 1;

        // If 'roleplay' or 'rp' was the command, we expect action in args[0].
        // But if `hug` was the command, args[0] is the Target.
        // We can check if args[0] is a valid action key. 
        // But wait, if command is `,hug`, then args[0] is User.

        // Let's rely on checking if the *command used* (from message content) matches an action.
        const prefix = ","; // Hardcoded for this file context, ideally distinct.
        const msgContent = message.content.slice(prefix.length).split(/ +/);
        const commandName = msgContent[0].toLowerCase();

        if (actions[commandName]) {
            actionKey = commandName;
            targetStart = 0; // Args start at 0 since command IS the action
        } else if (["roleplay", "rp"].includes(commandName)) {
            // actionKey is already args[0]
            targetStart = 1;
        } else {
            // Fallback
        }

        if (!actions[actionKey]) return message.reply(`${emojis.ERROR} Invalid action. Try available actions.`);

        const target = message.mentions.members.first() || await message.guild.members.fetch(args[targetStart]).catch(() => null);
        if (!target) return message.reply(`${emojis.ERROR} You need to mention someone to **${actionKey}**!`);

        const actionData = actions[actionKey];
        // Mock GIF logic
        const gif = "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif";

        const embed = new EmbedBuilder()
            .setColor(message.guild.members.me.displayHexColor)
            .setDescription(`**${message.author.username}** ${actionData.text} **${target.user.username}**!`)
            .setImage(gif);

        message.channel.send({ embeds: [embed] });
    },
};
