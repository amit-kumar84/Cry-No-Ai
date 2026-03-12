# 🎤 CRY-NO-AI Voice Assistant - Complete Setup Guide
## Discord Self-Bot with Real-Time User Tracking

---

## ⚠️ IMPORTANT DISCLAIMER

This application uses a **Discord User Token (Self-Bot)** approach, which:
- Allows tracking ANY user across ALL your mutual servers
- Does NOT require inviting a bot to servers
- Uses your Discord account to monitor another user

**Note:** Self-bots are against Discord's Terms of Service. Use at your own risk.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Prerequisites](#prerequisites)
4. [Get Discord User Token](#get-discord-user-token)
5. [Get Target User ID](#get-target-user-id)
6. [Deploy Backend to Railway](#deploy-backend-to-railway)
7. [Deploy Frontend to Vercel](#deploy-frontend-to-vercel)
8. [Test Your Setup](#test-your-setup)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What This App Does:
- ✅ Tracks a target user's Discord status in **real-time**
- ✅ Shows when they go online/offline/idle/DND
- ✅ Detects when they join/leave voice channels
- ✅ Shows which server and channel they're in
- ✅ Detects muted/deafened/streaming states
- ✅ Works across ALL mutual servers (no bot invite needed!)

### Architecture:
```
Your Discord Account Token
         │
         ▼
┌─────────────────────┐      WebSocket      ┌─────────────────┐
│  Railway Backend    │◄───────────────────►│  Vercel Frontend │
│  (Self-Bot Client)  │                     │  (Dashboard)     │
└─────────────────────┘                     └─────────────────┘
         │
         ▼
   Discord Gateway
   (Track ANY User)
```

---

## 🔧 How It Works

1. **Your Discord Token** connects to Discord's Gateway API
2. **Self-Bot** monitors the target user across all mutual servers
3. **WebSocket** sends real-time updates to the web dashboard
4. **Dashboard** displays beautiful cyberpunk UI with live status

**No Bot Needed!** - Since we use your account token, you can track anyone you share a server with.

---

## 📦 Prerequisites

- Discord Account (to get user token)
- Target User's Discord ID
- GitHub Account
- Railway Account (https://railway.app)
- Vercel Account (https://vercel.com)
- MongoDB Atlas Account (free tier: https://mongodb.com/atlas)

---

## 🔑 STEP 1: Get Discord User Token

### Method 1: Browser Developer Tools (Recommended)

1. **Open Discord in Browser**
   - Go to https://discord.com/app
   - Login to your account

2. **Open Developer Tools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

3. **Go to Network Tab**
   - Click on "Network" tab
   - In the filter box, type `api`

4. **Trigger an API Call**
   - Click on any channel or server in Discord
   - You'll see network requests appear

5. **Find Your Token**
   - Click on any request to `discord.com/api`
   - Go to "Headers" tab
   - Look for `Authorization` header
   - Copy the token value (starts with a long string)

### Method 2: Console Method

1. Open Discord in browser
2. Open Developer Tools (`F12`)
3. Go to "Console" tab
4. Paste this code and press Enter:

```javascript
(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
```

5. Copy the token that appears

### ⚠️ SECURITY WARNING
- **NEVER** share your token with anyone
- **NEVER** commit your token to GitHub
- Your token = Full access to your Discord account

---

## 👤 STEP 2: Get Target User ID

### Method 1: Discord Settings

1. Open Discord
2. Go to **User Settings** → **Advanced**
3. Enable **Developer Mode**
4. Right-click on the user you want to track
5. Click **"Copy User ID"**

### Your Target User ID:
```
656804552175124481
```

---

## 🚂 STEP 3: Deploy Backend to Railway

### 3.1 Push Code to GitHub

```bash
# Clone or download the project
git clone https://github.com/YOUR_USERNAME/cry-no-ai.git
cd cry-no-ai

# Make sure .env files are in .gitignore (IMPORTANT!)
echo "*.env" >> .gitignore
echo "backend/.env" >> .gitignore

# Commit and push
git add .
git commit -m "Initial commit"
git push origin main
```

### 3.2 Create Railway Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your repository

### 3.3 Configure Railway

1. Click on your service
2. Go to **Settings** tab
3. Set **Root Directory**: `backend`

### 3.4 Add Environment Variables

Go to **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `MONGO_URL` | `mongodb+srv://kumaramit812670:YOUR_PASSWORD@cluster0.y8slewi.mongodb.net/?appName=Cluster0` |
| `DB_NAME` | `cry_no_ai_db` |
| `DISCORD_USER_TOKEN` | `Your Discord Token from Step 1` |
| `TARGET_USER_ID` | `656804552175124481` |
| `AUTO_START_CLIENT` | `true` |
| `CORS_ORIGINS` | `*` |

### 3.5 Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy your URL (e.g., `https://cry-no-ai-production.up.railway.app`)

### 3.6 Verify Backend

Open in browser:
```
https://YOUR-RAILWAY-URL.up.railway.app/api/
```

You should see:
```json
{
  "message": "CRY-NO-AI Discord Voice Assistant API",
  "discord_available": true,
  "mode": "Self-Bot (User Token)",
  "status": "running"
}
```

---

## ▲ STEP 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository

### 4.2 Configure Build Settings

- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `yarn build`
- **Output Directory**: `build`

### 4.3 Add Environment Variable

| Name | Value |
|------|-------|
| `REACT_APP_BACKEND_URL` | `https://YOUR-RAILWAY-URL.up.railway.app` |

### 4.4 Deploy

Click **"Deploy"** and wait 2-3 minutes.

---

## 🔄 STEP 5: Update CORS

After Vercel deployment:

1. Go to Railway Dashboard → Variables
2. Update `CORS_ORIGINS` to:
```
https://your-app.vercel.app
```

---

## ✅ STEP 6: Test Your Setup

### Test Backend API:
```bash
# Check client status
curl https://YOUR-RAILWAY-URL.up.railway.app/api/client/status

# Check current status
curl https://YOUR-RAILWAY-URL.up.railway.app/api/status
```

### Test Frontend:
1. Open your Vercel URL
2. You should see the target user's status updating in real-time
3. When they join a VC, you'll see server and channel info!

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/` | GET | API info |
| `/api/status` | GET | Current user status |
| `/api/client/start` | POST | Start Self-Bot |
| `/api/client/stop` | POST | Stop Self-Bot |
| `/api/client/status` | GET | Client status |
| `/api/ws` | WebSocket | Real-time updates |

---

## 🔧 Troubleshooting

### "Token Invalid" Error
- Make sure you copied the entire token
- Token format should be a long string of letters/numbers
- Try getting a fresh token from Discord

### "User Not Found" 
- Make sure you share at least one server with the target user
- Verify the TARGET_USER_ID is correct
- Check if the target user is not blocked

### Status Not Updating
- Check Railway logs for errors
- Verify DISCORD_USER_TOKEN is correct
- Make sure AUTO_START_CLIENT is `true`

### WebSocket Connection Failed
- Verify REACT_APP_BACKEND_URL is correct
- Check if CORS_ORIGINS includes your Vercel domain
- Try clearing browser cache

### Railway Build Fails
- Check if requirements.txt is valid
- Make sure root directory is set to `backend`

---

## 📊 What Data Is Tracked

| Data | Description |
|------|-------------|
| Status | online, offline, idle, dnd |
| Voice State | speaking, listening, muted, deafened, streaming |
| Server Name | Which server they're in |
| Channel Name | Which voice channel |
| Member Count | How many in the VC |
| Avatar | Profile picture |
| Username | Display name |

---

## 🎉 You're Done!

Your CRY-NO-AI Voice Assistant is now live:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.up.railway.app`

The dashboard will automatically show real-time status of your target user!

---

## 🔒 Security Best Practices

1. ✅ Never commit tokens to GitHub
2. ✅ Use environment variables for all secrets
3. ✅ Rotate your token if compromised
4. ✅ Keep your Railway/Vercel dashboards private
5. ✅ Use a secondary Discord account if concerned

---

**Happy Tracking! 🎮**
