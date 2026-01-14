import { Events, ActivityType } from 'discord.js';
import logger from '../utils/logger.js';

export default {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    logger.success(`Logged in as ${client.user.tag}!`);
    logger.info(`Serving ${client.guilds.cache.size} guild(s)`);
    logger.info(`Loaded ${client.prefixCommands.size} command(s)`);

    // Load Sticky Messages
    client.stickyMessages = new Map();
    // Assuming simple table structure: channel_id, message, guild_id
    // We can fetch all. If too many, maybe fetch per guild? But "ready" is global.
    // Let's fetch all for now, assuming manageable size.
    import('../utils/database.js').then(async ({ default: db }) => {
      const { data, error } = await db.from('sticky_messages').select('*');
      if (error) {
        logger.error(`Failed to load sticky messages: ${error.message}`);
      } else if (data) {
        for (const sm of data) {
          client.stickyMessages.set(sm.channel_id, { text: sm.message, lastId: null });
        }
        logger.info(`Loaded ${data.length} sticky messages.`);
      }

      client.user.setPresence({
        activities: [
          {
            name: 'DM me to open ModMail 📩',
            type: ActivityType.Listening,
          }
        ],
        status: 'online',
      });
    });
  },
};
