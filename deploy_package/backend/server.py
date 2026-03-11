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
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RichPresenceConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    discord_client_id: str = ""
    app_name: str = "CRY-NO-AI Voice Assistant"
    version: str = "2.0"
    update_interval: int = 10
    enable_party: bool = True
    large_images: List[str] = ["logo", "working", "idle"]
    small_images: List[str] = ["python", "logo"]
    states: List[str] = ["Listening for commands", "Processing voice input", "Idle - Waiting"]
    buttons: List[Dict[str, str]] = []

class ConfigUpdate(BaseModel):
    discord_client_id: Optional[str] = None
    discord_bot_token: Optional[str] = None
    app_name: Optional[str] = None
    update_interval: Optional[int] = None
    enable_party: Optional[bool] = None
    states: Optional[List[str]] = None
    buttons: Optional[List[Dict[str, str]]] = None

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

# Discord Bot State
discord_bot_running = False
discord_bot_task = None

# ========== DISCORD BOT ==========

try:
    import discord
    from discord.ext import commands
    
    DISCORD_AVAILABLE = True
    
    class DiscordBot(commands.Bot):
        def __init__(self, manager: ConnectionManager, target_user_id: str = None):
            intents = discord.Intents.default()
            intents.guilds = True
            intents.voice_states = True
            intents.presences = True
            intents.members = True
            super().__init__(command_prefix="!", intents=intents)
            self.manager = manager
            self.target_user_id = target_user_id or os.environ.get('TARGET_USER_ID')
            self.monitored_user: Optional[discord.Member] = None
            
        async def on_ready(self):
            logger.info(f'Discord Bot logged in as {self.user}')
            logger.info(f'Monitoring user ID: {self.target_user_id}')
            self.loop.create_task(self.status_update_loop())
            
        async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
            if self.target_user_id and str(member.id) != self.target_user_id:
                return
            await self.update_and_broadcast_status(member)
            
        async def on_presence_update(self, before: discord.Member, after: discord.Member):
            if self.target_user_id and str(after.id) != self.target_user_id:
                return
            await self.update_and_broadcast_status(after)
            
        async def update_and_broadcast_status(self, member: discord.Member):
            voice = member.voice
            
            status = DiscordStatus(
                user_id=str(member.id),
                username=member.display_name or member.name,
                discriminator=member.discriminator or "0",
                avatar_url=str(member.display_avatar.url) if member.display_avatar else "",
                status=str(member.status),
                is_in_vc=voice is not None,
                timestamp=datetime.now(timezone.utc)
            )
            
            if voice:
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
                
                if voice.self_deaf or voice.deaf:
                    status.voice_state = "deafened"
                elif voice.self_mute or voice.mute:
                    status.voice_state = "muted"
                elif voice.self_stream:
                    status.voice_state = "streaming"
                else:
                    status.voice_state = "listening"
            else:
                status.voice_state = "none"
                
            # Save to database
            doc = status.model_dump(mode='json')
            await db.discord_status.update_one(
                {"user_id": status.user_id},
                {"$set": doc},
                upsert=True
            )
            
            await self.manager.broadcast(status)
            logger.info(f"Status updated: {status.username} - {status.voice_state}")
            
        async def status_update_loop(self):
            """Periodically update status for connected users"""
            while True:
                await asyncio.sleep(5)
                try:
                    if self.target_user_id:
                        for guild in self.guilds:
                            member = guild.get_member(int(self.target_user_id))
                            if member:
                                await self.update_and_broadcast_status(member)
                                break
                except Exception as e:
                    logger.error(f"Error in status update loop: {e}")

    bot_instance: Optional[DiscordBot] = None

except ImportError:
    DISCORD_AVAILABLE = False
    logger.warning("discord.py not available. Bot features disabled.")

# ========== API ROUTES ==========

@api_router.get("/")
async def root():
    return {
        "message": "CRY-NO-AI Discord Voice Assistant API",
        "discord_available": DISCORD_AVAILABLE,
        "version": "2.0",
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
    """Manually update status (for local Python script)"""
    await manager.broadcast(status)
    return {"success": True, "message": "Status updated"}

@api_router.get("/config")
async def get_config():
    """Get Rich Presence configuration"""
    config = await db.config.find_one({"type": "rich_presence"}, {"_id": 0})
    if not config:
        default_config = RichPresenceConfig()
        return default_config.model_dump()
    return config

@api_router.post("/config")
async def update_config(config: ConfigUpdate):
    """Update Rich Presence configuration"""
    update_dict = {k: v for k, v in config.model_dump().items() if v is not None}
    
    if "discord_bot_token" in update_dict:
        await db.secrets.update_one(
            {"type": "discord_bot_token"},
            {"$set": {"value": update_dict.pop("discord_bot_token")}},
            upsert=True
        )
    
    if update_dict:
        await db.config.update_one(
            {"type": "rich_presence"},
            {"$set": update_dict},
            upsert=True
        )
    
    return {"success": True, "message": "Configuration updated"}

@api_router.post("/bot/start")
async def start_discord_bot(user_id: Optional[str] = None):
    """Start the Discord bot"""
    global discord_bot_running, bot_instance, discord_bot_task
    
    if not DISCORD_AVAILABLE:
        raise HTTPException(status_code=503, detail="Discord.py not available")
    
    if discord_bot_running:
        return {"success": False, "message": "Bot already running"}
    
    token_doc = await db.secrets.find_one({"type": "discord_bot_token"})
    token = token_doc["value"] if token_doc else os.environ.get("DISCORD_BOT_TOKEN")
    
    if not token:
        raise HTTPException(status_code=400, detail="Discord bot token not configured. Add DISCORD_BOT_TOKEN to environment variables.")
    
    target_id = user_id or os.environ.get('TARGET_USER_ID')
    
    try:
        bot_instance = DiscordBot(manager, target_id)
        discord_bot_task = asyncio.create_task(bot_instance.start(token))
        discord_bot_running = True
        return {"success": True, "message": f"Bot starting... Monitoring user: {target_id}"}
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/bot/stop")
async def stop_discord_bot():
    """Stop the Discord bot"""
    global discord_bot_running, bot_instance, discord_bot_task
    
    if not discord_bot_running or not bot_instance:
        return {"success": False, "message": "Bot not running"}
    
    try:
        await bot_instance.close()
        if discord_bot_task:
            discord_bot_task.cancel()
        discord_bot_running = False
        bot_instance = None
        return {"success": True, "message": "Bot stopped"}
    except Exception as e:
        logger.error(f"Failed to stop bot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/bot/status")
async def get_bot_status():
    """Get Discord bot status"""
    return {
        "running": discord_bot_running,
        "discord_available": DISCORD_AVAILABLE,
        "connected_clients": len(manager.active_connections),
        "target_user_id": os.environ.get('TARGET_USER_ID', 'Not configured')
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

# Include the router in the main app
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
    """Auto-start Discord bot if configured"""
    if os.environ.get('AUTO_START_BOT', 'false').lower() == 'true':
        token = os.environ.get('DISCORD_BOT_TOKEN')
        if token and DISCORD_AVAILABLE:
            logger.info("Auto-starting Discord bot...")
            try:
                global bot_instance, discord_bot_task, discord_bot_running
                target_id = os.environ.get('TARGET_USER_ID')
                bot_instance = DiscordBot(manager, target_id)
                discord_bot_task = asyncio.create_task(bot_instance.start(token))
                discord_bot_running = True
                logger.info(f"Discord bot auto-started. Monitoring user: {target_id}")
            except Exception as e:
                logger.error(f"Failed to auto-start bot: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    global discord_bot_running, bot_instance
    if bot_instance and discord_bot_running:
        await bot_instance.close()
    client.close()
