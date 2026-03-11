# 🎤 CRY-NO-AI Voice Assistant - Complete Setup Guide

## Discord Voice Assistant with Rich Presence Integration

A complete voice assistant application that shows real-time Discord status including voice channel activity, speaking/listening states, and more - all displayed on a beautiful cyberpunk-themed web dashboard.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Discord Application Setup](#discord-application-setup)
5. [Discord Bot Setup](#discord-bot-setup)
6. [Web Dashboard Setup](#web-dashboard-setup)
7. [Local Python Script Setup](#local-python-script-setup)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## 🎯 Overview

This application consists of three main components:

1. **Web Dashboard** - A beautiful cyberpunk-themed React dashboard that displays real-time Discord status
2. **Backend API** - FastAPI server that handles WebSocket connections and Discord bot integration
3. **Local Python Script** - Optional local Rich Presence client for additional customization

### Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   Web Browser   │◄──────────────────►│  FastAPI Backend │
│   (Dashboard)   │                    │  (Server)        │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │ Discord Gateway
                                                ▼
                                       ┌─────────────────┐
                                       │  Discord Bot    │
                                       │  (Monitors VC)  │
                                       └─────────────────┘
```

---

## ✨ Features

### Real-time Discord Monitoring
- **User Status**: Online, Idle, DND, Offline
- **Voice State**: Speaking, Listening, Muted, Deafened
- **Voice Channel Info**: Server name, Channel name, Member count
- **Streaming Detection**: Know when user is streaming

### Web Dashboard
- 🎨 Cyberpunk/Futuristic theme with neon animations
- 📊 Audio visualizer (simulated based on voice state)
- 🔄 Real-time WebSocket updates
- 📱 Fully responsive design
- 🌐 Deployable online

### Rich Presence
- Custom status messages
- Rotating images
- Button links
- Party system support
- Timestamps

---

## 📦 Prerequisites

### For Web Dashboard
- Node.js 18+ (comes with the template)
- MongoDB (comes with the template)

### For Discord Bot
- Discord Account
- Discord Server (to add the bot)

### For Local Script (Optional)
- Python 3.8+
- Windows/macOS/Linux

---

## 🎮 Discord Application Setup

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it (e.g., "CRY-NO-AI Voice Assistant")
4. Click **"Create"**

### Step 2: Get Application ID

1. In your application, go to **"General Information"**
2. Copy the **"Application ID"** (also called Client ID)
3. Save this - you'll need it later

### Step 3: Upload Rich Presence Images

1. Go to **"Rich Presence"** → **"Art Assets"**
2. Click **"Add Image(s)"**
3. Upload your 512x512 PNG images:
   - `logo.png` - Main logo
   - `working.png` - Working state
   - `idle.png` - Idle state
   - `listening.png` - Listening state
   - `speaking.png` - Speaking state
   - `python.png` - Small icon
   - `online.png` - Online indicator
   - `away.png` - Away indicator

> **Note**: Image names become the keys you use in config. No spaces allowed.

### Step 4: Save Application

Click **"Save Changes"** at the bottom.

---

## 🤖 Discord Bot Setup

### Step 1: Create Bot

1. In your Discord Application, go to **"Bot"**
2. Click **"Add Bot"**
3. Confirm by clicking **"Yes, do it!"**

### Step 2: Get Bot Token

1. Under **"Token"**, click **"Reset Token"**
2. Copy the token immediately (it won't be shown again!)
3. **KEEP THIS SECRET** - Never share your bot token

### Step 3: Enable Intents

In the Bot settings, enable these **Privileged Gateway Intents**:
- ✅ **Presence Intent** - For user status
- ✅ **Server Members Intent** - For member info
- ✅ **Message Content Intent** (optional)

### Step 4: Generate Bot Invite Link

1. Go to **"OAuth2"** → **"URL Generator"**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ View Channels
   - ✅ Connect (to voice channels)
   - ✅ Read Message History
4. Copy the generated URL

### Step 5: Invite Bot to Server

1. Open the generated URL in your browser
2. Select your Discord server
3. Click **"Authorize"**
4. Complete the captcha

---

## 🌐 Web Dashboard Setup

### Step 1: Configure Backend

Add your Discord Bot Token to the backend `.env` file:

```bash
# /app/backend/.env
DISCORD_BOT_TOKEN=your_bot_token_here
```

### Step 2: Start the Bot

Send a POST request to start the bot:

```bash
curl -X POST "https://your-app-url/api/bot/start?user_id=YOUR_DISCORD_USER_ID"
```

Replace `YOUR_DISCORD_USER_ID` with your Discord user ID:
- Enable Developer Mode in Discord (Settings → Advanced)
- Right-click your profile → "Copy User ID"

### Step 3: Access Dashboard

Open your deployed URL in a browser. The dashboard will:
- Connect via WebSocket
- Display real-time status updates
- Show audio visualizer animations

---

## 🐍 Local Python Script Setup (Optional)

The local script provides additional Rich Presence features that run on your computer.

### Step 1: Download Files

Download these files to a folder:
- `voice_assistant_rich.py`
- `config.json`
- `create_images.py`
- `setup_and_run.bat` (Windows)
- `build_exe.py` (to create .exe)

### Step 2: Run Setup (Windows)

Double-click `setup_and_run.bat` or run in terminal:

```batch
setup_and_run.bat
```

This will:
1. Check Python installation
2. Create virtual environment
3. Install dependencies
4. Generate default icons
5. Start the voice assistant

### Step 3: Manual Setup (macOS/Linux)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install pypresence pillow websockets aiohttp

# Generate icons
python create_images.py

# Run the assistant
python voice_assistant_rich.py
```

### Step 4: Configure

Edit `config.json`:

```json
{
    "discord_client_id": "YOUR_APPLICATION_ID",
    "app_name": "CRY-NO-AI Voice Assistant",
    "web_dashboard_url": "https://your-deployed-url.com",
    "enable_web_sync": true
}
```

---

## ⚙️ Configuration

### config.json Options

| Option | Type | Description |
|--------|------|-------------|
| `discord_client_id` | string | Your Discord Application ID |
| `app_name` | string | Display name in Rich Presence |
| `version` | string | Version shown in status |
| `update_interval` | number | Seconds between status updates |
| `enable_party` | boolean | Enable party system in VC |
| `web_dashboard_url` | string | URL of deployed dashboard |
| `enable_web_sync` | boolean | Sync status to web dashboard |
| `rich_presence.large_images` | array | Large image keys to cycle |
| `rich_presence.small_images` | array | Small image keys to cycle |
| `rich_presence.states` | array | Status messages to rotate |
| `rich_presence.buttons` | array | Buttons with labels and URLs |

### Backend Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_BOT_TOKEN` | Your Discord bot token |
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |

---

## 🔧 Troubleshooting

### Discord Connection Issues

**Problem**: "Discord not running" error
- **Solution**: Make sure Discord desktop app is running (web version won't work)

**Problem**: "Invalid Client ID" error
- **Solution**: Check your Application ID is correct in config.json

**Problem**: Bot not responding
- **Solution**: 
  1. Check bot token is correct
  2. Verify bot is in the server
  3. Check intents are enabled

### WebSocket Issues

**Problem**: Dashboard shows "Reconnecting..."
- **Solution**:
  1. Check backend is running
  2. Verify CORS settings allow your domain
  3. Check browser console for errors

### Rich Presence Not Showing

**Problem**: Status not appearing in Discord
- **Solution**:
  1. Disable "Display current activity" then re-enable it
  2. Restart Discord
  3. Check Game Activity settings in Discord

### Image Issues

**Problem**: Images not showing in Rich Presence
- **Solution**:
  1. Images must be exactly 512x512 PNG
  2. Wait 10-15 minutes after uploading (Discord caches)
  3. Image key must match exactly (case-sensitive)

---

## ❓ FAQ

### Q: Can I use this without a Discord bot?

**A:** Yes! The local Python script works independently using Rich Presence. The bot is only needed for real-time VC monitoring on the web dashboard.

### Q: Is my bot token safe?

**A:** Never share your bot token publicly. Store it in environment variables, not in code.

### Q: Why isn't my voice state updating?

**A:** The bot needs to be in the same server as you. Make sure:
1. Bot is invited to your server
2. Bot has correct permissions
3. You've specified your user ID when starting the bot

### Q: Can others see my status?

**A:** 
- Rich Presence: Only Discord friends can see your "Playing" status
- Web Dashboard: Anyone with the URL can see it (if deployed publicly)

### Q: How do I add more images?

**A:** 
1. Create 512x512 PNG images
2. Upload to Discord Developer Portal → Rich Presence → Art Assets
3. Add the image key to your config.json arrays

### Q: Does this work on mobile?

**A:** 
- Web Dashboard: Yes, fully responsive
- Rich Presence: Only on desktop Discord

---

## 🚀 Quick Start Checklist

- [ ] Created Discord Application
- [ ] Copied Application ID
- [ ] Created Discord Bot
- [ ] Copied Bot Token (keep secret!)
- [ ] Enabled Privileged Intents
- [ ] Invited Bot to server
- [ ] Added Bot Token to backend .env
- [ ] Started the bot via API
- [ ] Opened web dashboard
- [ ] (Optional) Set up local Python script

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Discord Developer Documentation
3. Check browser/server console for errors

---

## 📄 License

MIT License - Feel free to modify and use as needed.

---

**Happy Monitoring! 🎮**
