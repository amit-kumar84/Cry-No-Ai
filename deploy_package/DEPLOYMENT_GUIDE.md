# 🚀 CRY-NO-AI Deployment Guide
## Railway (Backend) + Vercel (Frontend) - Self-Bot Mode

---

## 📋 Quick Checklist

Before deploying, you need:
- [x] Discord User Token (from browser dev tools)
- [x] Target User ID: `656804552175124481`
- [x] MongoDB Atlas: `mongodb+srv://kumaramit812670:<password>@cluster0.y8slewi.mongodb.net/`
- [ ] Railway Account
- [ ] Vercel Account
- [ ] GitHub Repository

---

## 🔑 Get Your Discord User Token

1. Open https://discord.com/app in browser
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Paste this and press Enter:

```javascript
(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
```

5. Copy the token that appears (keep it secret!)

---

## 📤 Push to GitHub

```bash
cd /your-project-folder

# Initialize git
git init

# Make sure secrets are ignored!
echo ".env" >> .gitignore
echo "backend/.env" >> .gitignore

# Add and commit
git add .
git commit -m "CRY-NO-AI Self-Bot"

# Push to your repo
git remote add origin https://github.com/amit-kumar84/Cry-No-Ai.git
git branch -M main
git push -u origin main --force
```

---

## 🚂 Deploy Backend to Railway

### Step 1: Create Project
1. Go to https://railway.app/dashboard
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository

### Step 2: Configure
1. Click on your service → **Settings**
2. Set **Root Directory**: `backend`

### Step 3: Add Environment Variables

| Variable | Value |
|----------|-------|
| `MONGO_URL` | `mongodb+srv://kumaramit812670:YOUR_DB_PASSWORD@cluster0.y8slewi.mongodb.net/?appName=Cluster0` |
| `DB_NAME` | `cry_no_ai_db` |
| `DISCORD_USER_TOKEN` | `YOUR_DISCORD_TOKEN_HERE` |
| `TARGET_USER_ID` | `656804552175124481` |
| `AUTO_START_CLIENT` | `true` |
| `CORS_ORIGINS` | `*` |

### Step 4: Deploy & Get URL
1. Railway auto-deploys after adding variables
2. Go to **Settings** → **Networking** → **Generate Domain**
3. Copy your URL: `https://xxx.up.railway.app`

### Step 5: Verify
```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/api/
```

Expected response:
```json
{
  "message": "CRY-NO-AI Discord Voice Assistant API",
  "mode": "Self-Bot (User Token)",
  "status": "running"
}
```

---

## ▲ Deploy Frontend to Vercel

### Step 1: Create Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository

### Step 2: Configure Build
- **Root Directory**: `frontend`
- **Framework**: Create React App
- **Build Command**: `yarn build`

### Step 3: Add Environment Variable

| Name | Value |
|------|-------|
| `REACT_APP_BACKEND_URL` | `https://YOUR-RAILWAY-URL.up.railway.app` |

### Step 4: Deploy
Click **"Deploy"** - wait 2-3 minutes.

---

## 🔄 Update CORS (Important!)

After Vercel gives you a URL:

1. Go to **Railway** → **Variables**
2. Update `CORS_ORIGINS`:
```
https://your-project.vercel.app
```

---

## ✅ Test Everything

### 1. Check Backend:
```bash
# API Status
curl https://YOUR-RAILWAY-URL.up.railway.app/api/

# Client Status  
curl https://YOUR-RAILWAY-URL.up.railway.app/api/client/status

# Current User Status
curl https://YOUR-RAILWAY-URL.up.railway.app/api/status
```

### 2. Check Frontend:
- Open your Vercel URL
- Should show "CONNECTED" status
- Target user's status should appear!

---

## 🔧 Manual Client Control

```bash
# Start Self-Bot
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/client/start

# Stop Self-Bot
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/client/stop

# Check Status
curl https://YOUR-RAILWAY-URL.up.railway.app/api/client/status
```

---

## ⚠️ Common Issues

### "discord.py-self not found"
Railway needs to install from git. The requirements.txt handles this.

### "Token Invalid"
- Get a fresh token from Discord
- Make sure you're using USER token, not bot token

### "Target User Not Found"
- You must share at least one server with the target
- Verify the User ID is correct

### "WebSocket Not Connecting"
- Check REACT_APP_BACKEND_URL in Vercel
- Update CORS_ORIGINS in Railway

---

## 📁 Project Structure

```
cry-no-ai/
├── backend/              # Railway deploys this
│   ├── server.py         # Self-Bot + API
│   ├── requirements.txt
│   ├── Procfile
│   └── .env.example
│
├── frontend/             # Vercel deploys this
│   ├── src/
│   ├── package.json
│   └── vercel.json
│
└── SETUP_GUIDE.md
```

---

## 🎉 Success!

Your app is now tracking the target user across ALL mutual servers!

**URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-project.up.railway.app`

**What's Working:**
- ✅ Real-time status tracking
- ✅ Voice channel detection
- ✅ Server/channel info
- ✅ Muted/deafened states
- ✅ Streaming detection
- ✅ Works on ALL mutual servers

---

**Made with ❤️**
