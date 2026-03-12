from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'cry_no_ai_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the main app
app = FastAPI(title="CRY-NO-AI Discord Voice Assistant API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========== MODELS ==========

class DiscordStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = ""
    username: str = ""
    discriminator: str = ""
    avatar_url: str = ""
    status: str = "offline"
    voice_state: str = "none"
    is_in_vc: bool = False
    server_name: str = ""
    server_id: str = ""
    server_member_count: int = 0
    channel_name: str = ""
    channel_id: str = ""
    channel_member_count: int = 0
    is_muted: bool = False
    is_deafened: bool = False
    is_self_muted: bool = False
    is_self_deafened: bool = False
    is_streaming: bool = False
    is_video: bool = False
    is_speaking: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConfigUpdate(BaseModel):
    discord_user_token: Optional[str] = None
    target_user_id: Optional[str] = None
    app_name: Optional[str] = None
    update_interval: Optional[int] = None

# ========== GLOBAL STATE ==========

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.current_status: DiscordStatus = DiscordStatus()
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await websocket.send_json(self.current_status.model_dump(mode='json'))
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
        
    async def broadcast(self, status: DiscordStatus):
        self.current_status = status
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(status.model_dump(mode='json'))
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# Discord Self-Bot State
discord_client_running = False
discord_client_task = None

# ========== DISCORD SELF-BOT CLIENT ==========

try:
    import discord
    from discord.ext import commands
    
    DISCORD_AVAILABLE = True
    
    class DiscordSelfBot(discord.Client):
        """
        Discord Self-Bot Client using User Account Token
        Tracks target user across ALL servers
        """
        def __init__(self, manager: ConnectionManager, target_user_id: str):
            # Self-bot intents
            super().__init__()
            self.manager = manager
            self.target_user_id = target_user_id
            self.last_voice_state = None
            self.speaking_users = set()
            
        async def on_ready(self):
            logger.info(f'✅ Discord Self-Bot logged in as: {self.user}')
            logger.info(f'🎯 Tracking User ID: {self.target_user_id}')
            logger.info(f'📡 Connected to {len(self.guilds)} servers')
            
            # Initial status check
            await self.check_target_user_status()
            
            # Start monitoring loop
            self.loop.create_task(self.status_monitor_loop())
            
        async def on_presence_update(self, before, after):
            """Track presence changes (online/offline/idle/dnd)"""
            if str(after.id) == self.target_user_id:
                logger.info(f"👤 Presence update: {after.name} -> {after.status}")
                await self.update_target_status(after)
                
        async def on_voice_state_update(self, member, before, after):
            """Track voice state changes (join/leave VC, mute, deafen, etc.)"""
            if str(member.id) == self.target_user_id:
                logger.info(f"🎤 Voice state update: {member.name}")
                
                # Detect speaking state change
                if after.channel:
                    if before.self_mute != after.self_mute:
                        logger.info(f"  Mute: {before.self_mute} -> {after.self_mute}")
                    if before.self_deaf != after.self_deaf:
                        logger.info(f"  Deafen: {before.self_deaf} -> {after.self_deaf}")
                        
                await self.update_target_status(member)
        
        async def on_typing(self, channel, user, when):
            """Optional: Track typing activity"""
            if str(user.id) == self.target_user_id:
                logger.debug(f"⌨️ {user.name} is typing in {channel.name}")
                
        async def check_target_user_status(self):
            """Find and check target user status across all servers"""
            for guild in self.guilds:
                member = guild.get_member(int(self.target_user_id))
                if member:
                    logger.info(f"📍 Found target user in: {guild.name}")
                    await self.update_target_status(member)
                    return True
            
            # User not found in any mutual server
            logger.warning(f"⚠️ Target user {self.target_user_id} not found in any server")
            status = DiscordStatus(
                user_id=self.target_user_id,
                username="User Not Found",
                status="unknown",
                voice_state="none",
                timestamp=datetime.now(timezone.utc)
            )
            await self.manager.broadcast(status)
            return False
                
        async def update_target_status(self, member):
            """Update and broadcast target user's status"""
            voice = member.voice
            
            # Build status object
            status = DiscordStatus(
                user_id=str(member.id),
                username=member.display_name or member.name,
                discriminator=str(member.discriminator) if member.discriminator else "0",
                avatar_url=str(member.display_avatar.url) if member.display_avatar else "",
                status=str(member.status),
                is_in_vc=voice is not None,
                timestamp=datetime.now(timezone.utc)
            )
            
            if voice and voice.channel:
                channel = voice.channel
                guild = member.guild
                
                status.server_name = guild.name
                status.server_id = str(guild.id)
                status.server_member_count = guild.member_count or 0
                status.channel_name = channel.name
                status.channel_id = str(channel.id)
                status.channel_member_count = len(channel.members)
                status.is_muted = voice.mute
                status.is_deafened = voice.deaf
                status.is_self_muted = voice.self_mute
                status.is_self_deafened = voice.self_deaf
                status.is_streaming = voice.self_stream
                status.is_video = voice.self_video
                
                # Determine voice state
                if voice.self_deaf or voice.deaf:
                    status.voice_state = "deafened"
                elif voice.self_mute or voice.mute:
                    status.voice_state = "muted"
                elif voice.self_stream:
                    status.voice_state = "streaming"
                else:
                    # Check if user is in speaking_users set
                    if str(member.id) in self.speaking_users:
                        status.voice_state = "speaking"
                        status.is_speaking = True
                    else:
                        status.voice_state = "listening"
                        
                logger.info(f"📊 Status: {status.username} | {status.status} | VC: {status.channel_name} | State: {status.voice_state}")
            else:
                status.voice_state = "none"
                logger.info(f"📊 Status: {status.username} | {status.status} | Not in VC")
                
            # Save to database
            doc = status.model_dump(mode='json')
            await db.discord_status.update_one(
                {"user_id": status.user_id},
                {"$set": doc},
                upsert=True
            )
            
            # Broadcast to all WebSocket clients
            await self.manager.broadcast(status)
            
        async def status_monitor_loop(self):
            """Periodically check and update target user status"""
            while True:
                await asyncio.sleep(3)  # Check every 3 seconds for real-time updates
                try:
                    for guild in self.guilds:
                        member = guild.get_member(int(self.target_user_id))
                        if member:
                            await self.update_target_status(member)
                            break
                except Exception as e:
                    logger.error(f"Error in status monitor loop: {e}")

    discord_client_instance: Optional[DiscordSelfBot] = None

except ImportError as e:
    DISCORD_AVAILABLE = False
    logger.error(f"Discord library not available: {e}")
    logger.warning("Install with: pip install discord.py-self")

# ========== API ROUTES ==========

@api_router.get("/")
async def root():
    return {
        "message": "CRY-NO-AI Discord Voice Assistant API",
        "discord_available": DISCORD_AVAILABLE,
        "version": "2.0",
        "mode": "Self-Bot (User Token)",
        "status": "running"
    }

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.get("/status")
async def get_current_status():
    """Get the current Discord status"""
    return manager.current_status.model_dump(mode='json')

@api_router.post("/status/update")
async def update_status(status: DiscordStatus):
    """Manually update status"""
    await manager.broadcast(status)
    return {"success": True, "message": "Status updated"}

@api_router.get("/config")
async def get_config():
    """Get current configuration"""
    config = await db.config.find_one({"type": "selfbot_config"}, {"_id": 0})
    return config or {
        "target_user_id": os.environ.get('TARGET_USER_ID', ''),
        "auto_start": os.environ.get('AUTO_START_CLIENT', 'true'),
        "update_interval": 3
    }

@api_router.post("/config")
async def update_config(config: ConfigUpdate):
    """Update configuration"""
    update_dict = {k: v for k, v in config.model_dump().items() if v is not None}
    
    if "discord_user_token" in update_dict:
        # Store token securely
        await db.secrets.update_one(
            {"type": "discord_user_token"},
            {"$set": {"value": update_dict.pop("discord_user_token")}},
            upsert=True
        )
        logger.info("Discord User Token updated")
    
    if update_dict:
        await db.config.update_one(
            {"type": "selfbot_config"},
            {"$set": update_dict},
            upsert=True
        )
    
    return {"success": True, "message": "Configuration updated"}

@api_router.post("/client/start")
async def start_discord_client(target_user_id: Optional[str] = None):
    """Start the Discord Self-Bot client"""
    global discord_client_running, discord_client_instance, discord_client_task
    
    if not DISCORD_AVAILABLE:
        raise HTTPException(status_code=503, detail="Discord library not available. Install discord.py-self")
    
    if discord_client_running:
        return {"success": False, "message": "Client already running"}
    
    # Get user token from database or environment
    token_doc = await db.secrets.find_one({"type": "discord_user_token"})
    token = token_doc["value"] if token_doc else os.environ.get("DISCORD_USER_TOKEN")
    
    if not token:
        raise HTTPException(
            status_code=400, 
            detail="Discord User Token not configured. Add DISCORD_USER_TOKEN to environment variables."
        )
    
    # Get target user ID
    target_id = target_user_id or os.environ.get('TARGET_USER_ID')
    
    if not target_id:
        raise HTTPException(
            status_code=400,
            detail="Target User ID not configured. Add TARGET_USER_ID to environment variables."
        )
    
    try:
        discord_client_instance = DiscordSelfBot(manager, target_id)
        discord_client_task = asyncio.create_task(discord_client_instance.start(token))
        discord_client_running = True
        
        return {
            "success": True, 
            "message": f"Self-Bot client starting... Tracking user: {target_id}"
        }
    except Exception as e:
        logger.error(f"Failed to start client: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/client/stop")
async def stop_discord_client():
    """Stop the Discord Self-Bot client"""
    global discord_client_running, discord_client_instance, discord_client_task
    
    if not discord_client_running or not discord_client_instance:
        return {"success": False, "message": "Client not running"}
    
    try:
        await discord_client_instance.close()
        if discord_client_task:
            discord_client_task.cancel()
        discord_client_running = False
        discord_client_instance = None
        return {"success": True, "message": "Client stopped"}
    except Exception as e:
        logger.error(f"Failed to stop client: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/client/status")
async def get_client_status():
    """Get Discord Self-Bot client status"""
    return {
        "running": discord_client_running,
        "discord_available": DISCORD_AVAILABLE,
        "connected_clients": len(manager.active_connections),
        "target_user_id": os.environ.get('TARGET_USER_ID', 'Not configured'),
        "mode": "Self-Bot (User Token)"
    }

@api_router.get("/history")
async def get_status_history(limit: int = 100):
    """Get status history from database"""
    history = await db.discord_status.find(
        {},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return history

# ========== WEBSOCKET ==========

@api_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif message.get("type") == "status_update":
                    status = DiscordStatus(**message.get("data", {}))
                    await manager.broadcast(status)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Include the router
app.include_router(api_router)

# CORS Configuration
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== STARTUP/SHUTDOWN ==========

@app.on_event("startup")
async def startup_event():
    """Auto-start Discord Self-Bot if configured"""
    if os.environ.get('AUTO_START_CLIENT', 'true').lower() == 'true':
        token = os.environ.get('DISCORD_USER_TOKEN')
        target_id = os.environ.get('TARGET_USER_ID')
        
        if token and target_id and DISCORD_AVAILABLE:
            logger.info("🚀 Auto-starting Discord Self-Bot...")
            try:
                global discord_client_instance, discord_client_task, discord_client_running
                discord_client_instance = DiscordSelfBot(manager, target_id)
                discord_client_task = asyncio.create_task(discord_client_instance.start(token))
                discord_client_running = True
                logger.info(f"✅ Self-Bot auto-started. Tracking user: {target_id}")
            except Exception as e:
                logger.error(f"❌ Failed to auto-start Self-Bot: {e}")
        else:
            if not token:
                logger.warning("⚠️ DISCORD_USER_TOKEN not set - Self-Bot not started")
            if not target_id:
                logger.warning("⚠️ TARGET_USER_ID not set - Self-Bot not started")

@app.on_event("shutdown")
async def shutdown_event():
    global discord_client_running, discord_client_instance
    if discord_client_instance and discord_client_running:
        await discord_client_instance.close()
    client.close()
