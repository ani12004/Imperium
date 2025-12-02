# Discord Bot Universal

A complete, multi-purpose Discord bot built with **Discord.js v14**. This bot features a robust command handler, universal economy system, social features, moderation tools, leveling, tickets, and more.

**🌐 Website:** [universalgg.netlify.app](https://universalgg.netlify.app/)

## 🚀 Features

- **Universal Economy**: Global balance across all servers with banking, working, and trading.
- **Social System**: Profiles, marriage, family trees, and customizable bios.
- **OwO-Style Commands**: Actions (hug, kiss), emotes, gambling, and animal collection.
- **Advanced Moderation**: Ban, kick, timeout, nuke, lock, and warning system.
- **Leveling System**: XP tracking, rank cards, and level-up announcements.
- **Ticket System**: Advanced support ticket management with transcripts and DM support (Modmail).
- **Utility**: Image generation (quotes), polls, user/server info, and more.
- **Dynamic Prefix**: Customizable prefix per server (default: `s?`).
- **Database**: SQLite-based persistence using `better-sqlite3`.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v16.9.0 or higher)
- **Library**: [Discord.js v14](https://discord.js.org/)
- **Database**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
- **Image Processing**: [Canvas](https://www.npmjs.com/package/canvas)
- **Process Manager**: [PM2](https://pm2.keymetrics.io/) (optional, for production)

## 📋 Prerequisites

- Node.js v16.9.0 or higher
- A Discord Bot Token (Get it from the [Discord Developer Portal](https://discord.com/developers/applications))
- **Privileged Intents**: You must enable **Message Content Intent**, **Server Members Intent**, and **Presence Intent** in the Discord Developer Portal.

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/discord-bot-2.0.git
   cd discord-bot-2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   *Note: This project uses `canvas`, which may require additional system dependencies on Linux (e.g., `libcairo2-dev`).*

3. **Configure Environment Variables**
   - Rename `.env.example` to `.env`.
   - Open `.env` and paste your Discord Bot Token.
   ```env
   DISCORD_TOKEN=your_token_here
   ```

4. **Start the Bot**
   - **Development Mode**:
     ```bash
     npm start
     ```
   - **Production Mode (using PM2)**:
     ```bash
     npm install -g pm2
     pm2 start ecosystem.config.js
     pm2 save
     pm2 logs
     ```

## 🎮 Commands

The default prefix is `s?`. You can change it using `s?setprefix`.

### 💰 Economy (Universal)
- `s?balance` - Check wallet and bank balance.
- `s?deposit <amount|all>` - Deposit money into the bank.
- `s?withdraw <amount|all>` - Withdraw money from the bank.
- `s?pay <user> <amount>` - Transfer money to another user.
- `s?work` - Work to earn money.
- `s?daily` - Claim daily reward.
- `s?rob <user>` - Attempt to rob a user.
- `s?eco <add|remove|set> <user> <amount>` - Admin economy management.

### ❤️ Social & OwO
- `s?profile` - View your profile (Bio, Partner, Family, Stats).
- `s?setbio <text>` - Set your profile biography.
- `s?marry <user>` - Propose to a user.
- `s?divorce` - Divorce your partner.
- `s?adopt <user>` - Adopt a child.
- `s?disown <user>` - Disown a child.
- `s?family` - View your family tree.
- **Actions**: `s?hug`, `s?kiss`, `s?slap`, `s?pat`, `s?cuddle`, `s?poke`, `s?kill`.
- **Emotes**: `s?dance`, `s?cry`.
- **Gambling**: `s?slots`, `s?coinflip`.
- **Animals**: `s?hunt`, `s?zoo`, `s?sell`.

### 🛡️ Moderation
- `s?ban <user>` - Ban a member.
- `s?kick <user>` - Kick a member.
- `s?timeout <user> <duration>` - Timeout a member.
- `s?unban <userID>` - Unban a user.
- `s?warn <user> <reason>` - Warn a user.
- `s?warnings <user>` - Check user warnings.
- `s?clearwarns <user>` - Clear user warnings.
- `s?nuke` - Delete and recreate the current channel.
- `s?purge <amount>` - Delete messages.
- `s?lock` / `s?unlock` - Lock/Unlock channel.

### 🎫 Tickets & Modmail
- `s?tsetup` - Setup the ticket panel.
- `s?tclose` - Close a ticket.
- `s?tadd <user>` - Add a user to a ticket.
- `s?tremove <user>` - Remove a user from a ticket.
- **Modmail**: DM the bot to open a support ticket.

### 🛠️ Utility & Config
- `s?quote <text>` - Generate a quote image (or reply to a message).
- `s?poll <question>` - Create a poll.
- `s?say <message>` - Make the bot speak (supports embeds).
- `s?avatar <user>` - View user avatar.
- `s?banner <user>` - View user banner.
- `s?serverinfo` / `s?userinfo` - View stats.
- `s?config` - Configure server settings (Welcome, Logs, Leveling).
- `s?setup` - Interactive server setup.

## ❓ Troubleshooting

### Bot not responding?
- Check if the bot is online.
- Ensure **Message Content Intent** is enabled in the Developer Portal.
- Check console for errors.

### Database errors?
- Ensure the `data` folder exists.
- If you see `SQLITE_ERROR`, try restarting the bot to apply migrations.
- **Git Conflict?** If `git pull` fails on `data/bot.sqlite`, run:
  ```bash
  git rm --cached data/bot.sqlite
  git pull
  ```

### "Missing Permissions"?
- Ensure the bot has `Administrator` or relevant permissions.
- Ensure the bot's role is higher than the target user.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
**© 2025 ANIL SUTHAR. All Rights Reserved.**

This project is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this file, via any medium, is strictly prohibited without the express written permission of the owner.
