# 🎤 CRY-NO-AI Voice Assistant

A Discord Voice Assistant with Rich Presence integration featuring a stunning cyberpunk-themed web dashboard that displays real-time Discord status.

![Dashboard Preview](https://via.placeholder.com/800x400/030305/00F0FF?text=CRY-NO-AI+Dashboard)

## ✨ Features

- **Real-time Discord Monitoring** via Discord Gateway API
- **Voice State Tracking**: Speaking, Listening, Muted, Deafened, Streaming
- **Server Info Display**: Server name, Channel name, Member counts
- **Cyberpunk Web Dashboard** with neon animations
- **Audio Visualizer** with animated bars and waveform
- **WebSocket** for instant status updates
- **Deployable** to Railway + Vercel

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Discord.py, Motor (MongoDB)
- **Database**: MongoDB Atlas
- **Deployment**: Railway (Backend) + Vercel (Frontend)

## 📁 Project Structure

```
├── backend/          # FastAPI Backend
│   ├── server.py     # Main API server + Discord bot
│   ├── Procfile      # Railway deployment
│   └── requirements.txt
│
├── frontend/         # React Frontend
│   ├── src/
│   │   ├── pages/    # Dashboard page
│   │   ├── components/  # UI components
│   │   └── hooks/    # WebSocket hook
│   └── vercel.json   # Vercel config
│
└── scripts/          # Local Python scripts
    ├── voice_assistant_rich.py  # Rich Presence client
    └── create_images.py         # Icon generator
```

## 🚀 Quick Deploy

### 1. Backend (Railway)
1. Connect GitHub repo to Railway
2. Set root directory to `backend`
3. Add environment variables:
   - `MONGO_URL` - MongoDB connection string
   - `DISCORD_BOT_TOKEN` - Your bot token
   - `TARGET_USER_ID` - Your Discord user ID
   - `AUTO_START_BOT` - `true`

### 2. Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variable:
   - `REACT_APP_BACKEND_URL` - Your Railway URL

📖 See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔧 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/` | GET | API status |
| `/api/status` | GET | Current Discord status |
| `/api/bot/start` | POST | Start Discord bot |
| `/api/bot/stop` | POST | Stop Discord bot |
| `/api/bot/status` | GET | Bot status |
| `/api/ws` | WebSocket | Real-time updates |

## 🤖 Discord Bot Setup

1. Create app at [Discord Developer Portal](https://discord.com/developers/applications)
2. Create bot and copy token
3. Enable intents: Presence, Server Members, Message Content
4. Invite bot to your server

## 📄 License

MIT License

---

**Made with ❤️ and ☕**
