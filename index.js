import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config } from 'dotenv';
import logger from './utils/logger.js';
import { loadEvents } from './utils/eventLoader.js';
import { loadPrefixCommands } from "./handlers/prefixHandler.js";
import { loadSlashCommands } from "./handlers/slashHandler.js";
import db from './utils/database.js'; // Init DB

config(); // Load .env FIRST

// ---------------------------------
// Web Server for Render
// ---------------------------------
import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Imperium Bot is Online!');
});

app.listen(port, () => {
  logger.info(`Web server is listening on port ${port}`);
});

// ---------------------------------
// Create the client BEFORE anything
// ---------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

// Collections
client.prefixCommands = new Collection();
client.db = db; // Attach DB to client

// ---------------------------------
// Start the bot
// ---------------------------------
async function startBot() {
  try {
    logger.info('Starting bot...');

    // Load events
    await loadEvents(client);

    // Load prefix commands
    await loadPrefixCommands(client);

    // Load slash commands
    await loadSlashCommands(client);

    // Load active tickets into memory
    client.activeTickets = new Map();
    const tickets = db.prepare('SELECT * FROM tickets WHERE closed = 0').all();
    for (const ticket of tickets) {
      client.activeTickets.set(ticket.channel_id, ticket);
    }
    logger.info(`Loaded ${tickets.length} active tickets.`);

    // Login bot
    await client.login(process.env.DISCORD_TOKEN);

  } catch (error) {
    logger.error(`Failed to start bot: ${error.message}`);
    process.exit(1);
  }
}

startBot();
