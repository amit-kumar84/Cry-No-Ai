# 🚀 CRY-NO-AI Deployment Guide
## Railway (Backend) + Vercel (Frontend)

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [x] Discord Bot Token (from Discord Developer Portal)
- [x] Discord User ID: `656804552175124481`
- [x] MongoDB Atlas Connection String
- [x] Railway Account (https://railway.app)
- [x] Vercel Account (https://vercel.com)
- [x] GitHub Account (for deployment)

---

## 🔧 STEP 1: Prepare Your Code

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `cry-no-ai-voice-assistant`
3. Make it **Public** or **Private** (your choice)

### 1.2 Push Code to GitHub

Run these commands in your local terminal:

```bash
# Navigate to project directory
cd /path/to/your/project

# Initialize git (if not already)
git init

# Create .gitignore
echo "node_modules/
.env
__pycache__/
*.pyc
.DS_Store
build/
dist/
*.log
venv/" > .gitignore

# Add all files
git add .

# Commit
git commit -m "Initial commit - CRY-NO-AI Voice Assistant"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/cry-no-ai-voice-assistant.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🚂 STEP 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account (if not connected)
5. Select your `cry-no-ai-voice-assistant` repository
6. Railway will detect your project

### 2.2 Configure Root Directory

1. In Railway project settings, click on your service
2. Go to **Settings** tab
3. Under **"Root Directory"**, enter: `backend`
4. Click **"Save"**

### 2.3 Add Environment Variables

1. Go to **Variables** tab
2. Click **"+ New Variable"** and add each:

| Variable | Value |
|----------|-------|
| `MONGO_URL` | `mongodb+srv://kumaramit812670:YOUR_PASSWORD@cluster0.y8slewi.mongodb.net/?appName=Cluster0` |
| `DB_NAME` | `cry_no_ai_db` |
| `DISCORD_BOT_TOKEN` | `your_discord_bot_token_here` |
| `TARGET_USER_ID` | `656804552175124481` |
| `AUTO_START_BOT` | `true` |
| `CORS_ORIGINS` | `*` |

> ⚠️ **IMPORTANT**: Replace `YOUR_PASSWORD` with your actual MongoDB password!
> ⚠️ Replace `your_discord_bot_token_here` with your actual Discord Bot Token!

### 2.4 Deploy

1. Railway will automatically deploy after adding variables
2. Wait for deployment to complete (green checkmark)
3. Click **"Generate Domain"** in Settings
4. Copy your Railway URL (e.g., `https://cry-no-ai-backend.up.railway.app`)

### 2.5 Verify Backend

Open your Railway URL in browser:
```
https://YOUR-RAILWAY-URL.up.railway.app/api/
```

You should see:
```json
{
  "message": "CRY-NO-AI Discord Voice Assistant API",
  "discord_available": true,
  "version": "2.0",
  "status": "running"
}
```

---

## ▲ STEP 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will detect it's a React app

### 3.2 Configure Build Settings

1. **Framework Preset**: Create React App
2. **Root Directory**: `frontend`
3. **Build Command**: `yarn build`
4. **Output Directory**: `build`

### 3.3 Add Environment Variables

1. Expand **"Environment Variables"** section
2. Add:

| Name | Value |
|------|-------|
| `REACT_APP_BACKEND_URL` | `https://YOUR-RAILWAY-URL.up.railway.app` |

> Replace `YOUR-RAILWAY-URL` with your actual Railway backend URL from Step 2.4

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Your frontend will be live at: `https://your-project.vercel.app`

---

## 🔄 STEP 4: Update CORS (Important!)

After Vercel deployment, update Railway's CORS settings:

1. Go to Railway Dashboard → Your Project → Variables
2. Update `CORS_ORIGINS`:
   ```
   https://your-project.vercel.app,https://www.your-project.vercel.app
   ```
3. Railway will auto-redeploy

---

## ✅ STEP 5: Verify Everything Works

### 5.1 Test Backend
```bash
# Check API
curl https://YOUR-RAILWAY-URL.up.railway.app/api/

# Check Bot Status
curl https://YOUR-RAILWAY-URL.up.railway.app/api/bot/status
```

### 5.2 Test Frontend
1. Open your Vercel URL
2. Dashboard should show "CONNECTED" status
3. Join a Discord voice channel
4. Your status should update in real-time!

---

## 🤖 STEP 6: Discord Bot Setup (If Not Done)

### 6.1 Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it: `CRY-NO-AI Voice Assistant`

### 6.2 Create Bot
1. Go to **"Bot"** section
2. Click **"Add Bot"**
3. Copy the **Token** (this is your `DISCORD_BOT_TOKEN`)

### 6.3 Enable Intents
Under **"Privileged Gateway Intents"**, enable:
- ✅ PRESENCE INTENT
- ✅ SERVER MEMBERS INTENT
- ✅ MESSAGE CONTENT INTENT

### 6.4 Invite Bot to Server
1. Go to **"OAuth2"** → **"URL Generator"**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select permissions:
   - ✅ View Channels
   - ✅ Connect
   - ✅ Read Message History
4. Copy the generated URL
5. Open in browser and add bot to your Discord server

---

## 🔧 Troubleshooting

### Backend Not Starting
- Check Railway logs: Dashboard → Your Service → Logs
- Verify all environment variables are set correctly
- Check MongoDB connection string format

### WebSocket Not Connecting
- Verify `REACT_APP_BACKEND_URL` in Vercel is correct
- Check CORS_ORIGINS includes your Vercel domain
- Check browser console for errors

### Bot Not Monitoring
- Verify `DISCORD_BOT_TOKEN` is correct
- Verify `TARGET_USER_ID` is your Discord ID
- Make sure bot is in same server as you
- Check bot has proper permissions and intents

### Status Not Updating
- Ensure you're in a voice channel
- Check if bot is online in Discord server
- Verify Railway service is running

---

## 📁 Project Structure for Deployment

```
cry-no-ai-voice-assistant/
├── backend/                 # ← Railway deploys this
│   ├── server.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── railway.json
│   └── .env.example
│
├── frontend/                # ← Vercel deploys this
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
│
├── scripts/                 # Local Python scripts (optional)
└── README.md
```

---

## 🎉 You're Done!

Your CRY-NO-AI Voice Assistant is now deployed:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-railway-url.up.railway.app`

### What's Working:
- ✅ Real-time Discord status monitoring
- ✅ Voice channel detection
- ✅ Speaking/Listening/Muted/Deafened states
- ✅ Server and channel info
- ✅ Beautiful cyberpunk dashboard
- ✅ WebSocket real-time updates

---

## 📞 Quick Commands Reference

### Start Bot Manually (if AUTO_START_BOT is false)
```bash
curl -X POST "https://YOUR-RAILWAY-URL.up.railway.app/api/bot/start"
```

### Stop Bot
```bash
curl -X POST "https://YOUR-RAILWAY-URL.up.railway.app/api/bot/stop"
```

### Check Bot Status
```bash
curl "https://YOUR-RAILWAY-URL.up.railway.app/api/bot/status"
```

### Manual Status Update (for testing)
```bash
curl -X POST "https://YOUR-RAILWAY-URL.up.railway.app/api/status/update" \
  -H "Content-Type: application/json" \
  -d '{"username":"Test","status":"online","voice_state":"speaking","is_in_vc":true}'
```

---

**Happy Monitoring! 🎮**
