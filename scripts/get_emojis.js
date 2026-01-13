import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Fetching Application Emojis...');

    try {
        const emojis = await client.application.emojis.fetch();

        if (emojis.size === 0) {
            console.log('No application emojis found. Make sure you uploaded them to the Discord Developer Portal under the "Emojis" tab of your Application.');
        } else {
            console.log('\n--- APPLICATION EMOJIS ---');
            emojis.forEach(emoji => {
                console.log(`${emoji.name}: <:${emoji.name}:${emoji.id}> (ID: ${emoji.id})`);
            });
            console.log('--------------------------\n');
        }
    } catch (error) {
        console.error('Error fetching emojis:', error);
    }

    client.destroy();
});

client.login(process.env.DISCORD_TOKEN);
