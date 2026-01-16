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
import cors from 'cors'; // ADDED
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
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions, // ADDED: Required for Starboard/Clownboard
  ],
  partials: [
    Partials.Channel,
    Partials.Message,  // ADDED
    Partials.Reaction, // ADDED
    Partials.User      // ADDED
  ],
});

// Import DisTube
import { DisTube } from 'distube';
import { SoundCloudPlugin } from '@distube/soundcloud';
// import { YtDlpPlugin } from '@distube/yt-dlp'; // Replaced by custom handler
import { YtDlpPlugin } from './handlers/YtDlpPlugin.js';
import { SpotifyPlugin } from '@distube/spotify';

// Check for cookies file (optional, for YouTube Sign-in fix)
import fs from 'fs';
// Check if YOUTUBE_COOKIES env var exists and write it to a file
if (process.env.YOUTUBE_COOKIES) {
  try {
    fs.writeFileSync('cookies.txt', process.env.YOUTUBE_COOKIES);
    logger.info('Created cookies.txt from environment variable.');
  } catch (err) {
    logger.error('Failed to create cookies.txt from env var: ' + err);
  }
}

const cookiesPath = './cookies.txt';
const cookies = fs.existsSync(cookiesPath) ? cookiesPath : undefined;

// Spotify API credentials
const spotifyOptions = {
  api: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },
};
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  console.warn("Spotify API credentials missing. Falling back to scraping (unstable).");
}

// Init DisTube
client.distube = new DisTube(client, {
  plugins: [
    new SoundCloudPlugin(),
    new SpotifyPlugin(spotifyOptions),
    new YtDlpPlugin({ cookies })
  ],
  emitNewSongOnly: true,

  emitNewSongOnly: true,

  savePreviousSongs: true,
  ffmpeg: {
    args: {
      global: {
        'reconnect': '1',
        'reconnect_streamed': '1',
        'reconnect_delay_max': '5'
      }
    }
  }
});

// Load DisTube Events
import { loadDistubeEvents } from './handlers/distubeHandler.js';
loadDistubeEvents(client);

// Collections
client.prefixCommands = new Collection();
client.db = db; // Attach DB to client

// ---------------------------------
// Start the bot
// ---------------------------------

// ---------------------------------
// Global Error Handling (Fault Tolerance)
// ---------------------------------
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`[Anti-Crash] Unhandled Rejection: ${reason}`);
  // console.error(promise);
});

process.on('uncaughtException', (err) => {
  logger.error(`[Anti-Crash] Uncaught Exception: ${err}`);
  // console.error(err);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  logger.error(`[Anti-Crash] Uncaught Exception Monitor: ${err}, Origin: ${origin}`);
});

client.on('error', (error) => {
  logger.error(`[Client Error] ${error.message}`);
});

client.on('warn', (message) => {
  logger.warn(`[Client Warn] ${message}`);
});

let isInitialized = false;

async function startBot() {
  try {
    logger.info('Starting bot...');

    if (!isInitialized) {
      // Load events
      await loadEvents(client);

      // Load prefix commands
      await loadPrefixCommands(client);

      // Load slash commands
      await loadSlashCommands(client);

      isInitialized = true;
    }

    // Basic DB Check
    const { error } = await db.from('guild_configs').select('guild_id').limit(1);
    if (error) {
      logger.error(`Database connection failed: ${error.message}`);
      throw new Error("Database Unreachable");
    }
    logger.info("Database connection verified.");

    // Load active tickets into memory
    client.activeTickets = new Map();
    const { data: tickets } = await db.from('tickets').select('*').eq('closed', 0);
    if (tickets) {
      for (const ticket of tickets) {
        client.activeTickets.set(ticket.channel_id, ticket);
      }
    }
    logger.info(`Loaded ${tickets ? tickets.length : 0} active tickets.`);

    // Login bot
    await client.login(process.env.DISCORD_TOKEN);

  } catch (error) {
    logger.error(`Failed to start bot: ${error.message}`);
    // Retry login instead of exiting
    logger.info('Retrying registration in 5 seconds...');
    setTimeout(startBot, 5000);
  }
}


// ADDED: API Endpoint for Bot Stats
client.once('ready', () => {
  // Security: Restrict CORS to specific frontend domains
  const allowedOrigins = ['https://imperiumbot.netlify.app', 'http://localhost:3000', 'https://imperiumgg.netlify.app'];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));

  app.get('/api/bot-stats', (req, res) => {
    res.json({
      online: true,
      serverCount: client.guilds.cache.size,
      ping: client.ws.ping
    });
  });
});

startBot();
