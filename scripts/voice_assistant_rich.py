#!/usr/bin/env python3
"""
Discord Voice Assistant with Rich Presence
==========================================
A complete voice assistant application that integrates with Discord Rich Presence
to show real-time status, voice channel info, and custom status messages.

Features:
- Discord Rich Presence integration with rotating states
- Multiple image support (large/small images)
- Button integration with custom URLs
- Party system support
- Real-time status updates to web dashboard
- Automatic reconnection handling
"""

import asyncio
import json
import os
import sys
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
import threading

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('voice_assistant.log')
    ]
)
logger = logging.getLogger(__name__)

# Try to import required packages
try:
    from pypresence import Presence, ActivityType
    PYPRESENCE_AVAILABLE = True
except ImportError:
    PYPRESENCE_AVAILABLE = False
    logger.warning("pypresence not installed. Run: pip install pypresence")

try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False
    logger.warning("websockets not installed. Run: pip install websockets")

try:
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False
    logger.warning("aiohttp not installed. Run: pip install aiohttp")


class Config:
    """Configuration handler for the voice assistant"""
    
    DEFAULT_CONFIG = {
        "discord_client_id": "",
        "app_name": "CRY-NO-AI Voice Assistant",
        "version": "2.0",
        "update_interval": 15,
        "enable_party": False,
        "web_dashboard_url": "",
        "enable_web_sync": True,
        "rich_presence": {
            "large_images": ["logo", "working", "idle", "listening", "speaking"],
            "small_images": ["python", "online", "away"],
            "states": [
                "🎤 Listening for commands",
                "🔊 Processing voice input",
                "💤 Idle - Waiting",
                "🧠 Learning new commands",
                "🎧 In voice channel"
            ],
            "buttons": [
                {"label": "GitHub", "url": "https://github.com"},
                {"label": "Dashboard", "url": "https://example.com"}
            ]
        }
    }
    
    def __init__(self, config_path: str = "config.json"):
        self.config_path = Path(config_path)
        self.config = self.load()
    
    def load(self) -> Dict[str, Any]:
        """Load configuration from file or create default"""
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    loaded = json.load(f)
                    # Merge with defaults
                    merged = {**self.DEFAULT_CONFIG, **loaded}
                    merged['rich_presence'] = {
                        **self.DEFAULT_CONFIG['rich_presence'],
                        **loaded.get('rich_presence', {})
                    }
                    return merged
            except Exception as e:
                logger.error(f"Failed to load config: {e}")
                return self.DEFAULT_CONFIG.copy()
        else:
            self.save(self.DEFAULT_CONFIG)
            return self.DEFAULT_CONFIG.copy()
    
    def save(self, config: Dict[str, Any] = None):
        """Save configuration to file"""
        if config is None:
            config = self.config
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=4)
            logger.info(f"Configuration saved to {self.config_path}")
        except Exception as e:
            logger.error(f"Failed to save config: {e}")
    
    def get(self, key: str, default=None):
        """Get a configuration value"""
        keys = key.split('.')
        value = self.config
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, default)
            else:
                return default
        return value if value is not None else default


class DiscordRichPresence:
    """Discord Rich Presence handler with advanced features"""
    
    def __init__(self, config: Config):
        self.config = config
        self.rpc: Optional[Presence] = None
        self.connected = False
        self.start_time = None
        self.state_index = 0
        self.large_image_index = 0
        self.small_image_index = 0
        self.current_status = {
            "status": "online",
            "voice_state": "idle",
            "is_in_vc": False,
            "server_name": "",
            "channel_name": "",
            "channel_member_count": 0
        }
    
    def connect(self) -> bool:
        """Connect to Discord Rich Presence"""
        if not PYPRESENCE_AVAILABLE:
            logger.error("pypresence not available")
            return False
        
        client_id = self.config.get('discord_client_id')
        if not client_id:
            logger.error("Discord Client ID not configured")
            return False
        
        try:
            self.rpc = Presence(client_id)
            self.rpc.connect()
            self.connected = True
            self.start_time = time.time()
            logger.info("Connected to Discord Rich Presence")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Discord: {e}")
            self.connected = False
            return False
    
    def disconnect(self):
        """Disconnect from Discord Rich Presence"""
        if self.rpc:
            try:
                self.rpc.close()
                logger.info("Disconnected from Discord Rich Presence")
            except Exception as e:
                logger.error(f"Error disconnecting: {e}")
        self.connected = False
        self.rpc = None
    
    def update_status(self, status: Dict[str, Any] = None):
        """Update the Discord Rich Presence status"""
        if status:
            self.current_status.update(status)
        
        if not self.connected or not self.rpc:
            return False
        
        try:
            rp_config = self.config.get('rich_presence', {})
            
            # Rotate through states
            states = rp_config.get('states', [])
            if states:
                state = states[self.state_index % len(states)]
                self.state_index += 1
            else:
                state = "Active"
            
            # Build details based on current status
            if self.current_status.get('is_in_vc'):
                details = f"🎧 {self.current_status.get('channel_name', 'Voice Channel')}"
                state = f"👥 {self.current_status.get('channel_member_count', 0)} members"
            else:
                details = f"{self.config.get('app_name', 'Voice Assistant')} v{self.config.get('version', '1.0')}"
            
            # Rotate images
            large_images = rp_config.get('large_images', ['logo'])
            small_images = rp_config.get('small_images', ['python'])
            
            large_image = large_images[self.large_image_index % len(large_images)]
            small_image = small_images[self.small_image_index % len(small_images)]
            
            self.large_image_index += 1
            
            # Build buttons (max 2)
            buttons = rp_config.get('buttons', [])[:2]
            
            # Determine small image based on voice state
            voice_state = self.current_status.get('voice_state', 'idle')
            small_text = {
                'speaking': '🎤 Speaking',
                'listening': '🎧 Listening',
                'muted': '🔇 Muted',
                'deafened': '🔈 Deafened',
                'idle': '💤 Idle'
            }.get(voice_state, 'Active')
            
            # Update presence
            update_kwargs = {
                'state': state,
                'details': details,
                'start': self.start_time,
                'large_image': large_image,
                'large_text': self.config.get('app_name', 'Voice Assistant'),
                'small_image': small_image,
                'small_text': small_text
            }
            
            # Add buttons if available
            if buttons:
                update_kwargs['buttons'] = buttons
            
            # Add party if enabled
            if self.config.get('enable_party') and self.current_status.get('is_in_vc'):
                update_kwargs['party_id'] = f"party_{self.current_status.get('channel_name', 'vc')}"
                update_kwargs['party_size'] = [
                    self.current_status.get('channel_member_count', 1),
                    max(self.current_status.get('channel_member_count', 1) + 5, 10)
                ]
            
            self.rpc.update(**update_kwargs)
            logger.debug("Rich Presence updated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update Rich Presence: {e}")
            # Try to reconnect
            self.connected = False
            return False
    
    def clear(self):
        """Clear the Rich Presence"""
        if self.rpc and self.connected:
            try:
                self.rpc.clear()
                logger.info("Rich Presence cleared")
            except Exception as e:
                logger.error(f"Failed to clear Rich Presence: {e}")


class WebDashboardSync:
    """Handles synchronization with the web dashboard"""
    
    def __init__(self, config: Config):
        self.config = config
        self.ws: Optional[Any] = None
        self.connected = False
        self.reconnect_delay = 5
    
    async def connect(self):
        """Connect to the web dashboard WebSocket"""
        if not WEBSOCKETS_AVAILABLE:
            logger.warning("websockets not available for dashboard sync")
            return
        
        url = self.config.get('web_dashboard_url')
        if not url:
            logger.info("Web dashboard URL not configured, skipping sync")
            return
        
        # Convert HTTP to WebSocket URL
        ws_url = url.replace('https://', 'wss://').replace('http://', 'ws://')
        ws_url = f"{ws_url}/api/ws"
        
        while True:
            try:
                async with websockets.connect(ws_url) as websocket:
                    self.ws = websocket
                    self.connected = True
                    logger.info(f"Connected to web dashboard: {ws_url}")
                    
                    # Keep connection alive
                    while True:
                        try:
                            message = await asyncio.wait_for(websocket.recv(), timeout=30)
                            data = json.loads(message)
                            if data.get('type') == 'pong':
                                continue
                            logger.debug(f"Received from dashboard: {data}")
                        except asyncio.TimeoutError:
                            # Send ping
                            await websocket.send(json.dumps({"type": "ping"}))
                        except Exception as e:
                            logger.error(f"WebSocket receive error: {e}")
                            break
                            
            except Exception as e:
                logger.error(f"WebSocket connection error: {e}")
                self.connected = False
                await asyncio.sleep(self.reconnect_delay)
    
    async def send_status(self, status: Dict[str, Any]):
        """Send status update to web dashboard"""
        if not self.connected or not self.ws:
            return
        
        try:
            message = {
                "type": "status_update",
                "data": {
                    **status,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            }
            await self.ws.send(json.dumps(message))
            logger.debug("Status sent to dashboard")
        except Exception as e:
            logger.error(f"Failed to send status to dashboard: {e}")
            self.connected = False


class VoiceAssistant:
    """Main Voice Assistant class that orchestrates all components"""
    
    def __init__(self, config_path: str = "config.json"):
        self.config = Config(config_path)
        self.rpc = DiscordRichPresence(self.config)
        self.dashboard = WebDashboardSync(self.config)
        self.running = False
        self.loop: Optional[asyncio.AbstractEventLoop] = None
    
    def setup_interactive(self):
        """Interactive setup for first-time users"""
        print("\n" + "="*60)
        print("  🎤 CRY-NO-AI Voice Assistant Setup")
        print("="*60)
        
        # Check for Discord Client ID
        client_id = self.config.get('discord_client_id')
        if not client_id:
            print("\n📋 Discord Application Setup Required")
            print("-" * 40)
            print("1. Go to: https://discord.com/developers/applications")
            print("2. Click 'New Application'")
            print("3. Name it (e.g., 'Voice Assistant')")
            print("4. Go to 'Rich Presence' -> 'Art Assets'")
            print("5. Upload your images (512x512 PNG)")
            print("6. Copy the 'Application ID' from General Information")
            print("-" * 40)
            
            client_id = input("\n🔑 Enter your Discord Application ID: ").strip()
            if client_id:
                self.config.config['discord_client_id'] = client_id
                self.config.save()
                print("✅ Application ID saved!")
        
        # Web dashboard URL
        dashboard_url = self.config.get('web_dashboard_url')
        if not dashboard_url:
            print("\n🌐 Web Dashboard Setup (Optional)")
            print("-" * 40)
            dashboard_url = input("Enter your web dashboard URL (or press Enter to skip): ").strip()
            if dashboard_url:
                self.config.config['web_dashboard_url'] = dashboard_url
                self.config.save()
                print("✅ Dashboard URL saved!")
        
        print("\n✅ Setup complete! Starting Voice Assistant...")
        print("="*60 + "\n")
    
    async def run_async(self):
        """Async main loop"""
        self.running = True
        
        # Connect to Discord Rich Presence
        while self.running and not self.rpc.connect():
            logger.info("Retrying Discord connection in 10 seconds...")
            await asyncio.sleep(10)
        
        if not self.running:
            return
        
        # Start dashboard sync if enabled
        dashboard_task = None
        if self.config.get('enable_web_sync'):
            dashboard_task = asyncio.create_task(self.dashboard.connect())
        
        # Main update loop
        update_interval = self.config.get('update_interval', 15)
        
        try:
            while self.running:
                # Update Rich Presence
                if not self.rpc.update_status():
                    # Try to reconnect
                    logger.info("Attempting to reconnect to Discord...")
                    self.rpc.connect()
                
                # Send status to dashboard
                if self.config.get('enable_web_sync') and self.dashboard.connected:
                    await self.dashboard.send_status(self.rpc.current_status)
                
                await asyncio.sleep(update_interval)
                
        except asyncio.CancelledError:
            logger.info("Update loop cancelled")
        finally:
            if dashboard_task:
                dashboard_task.cancel()
    
    def run(self):
        """Start the voice assistant"""
        self.setup_interactive()
        
        try:
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
            self.loop.run_until_complete(self.run_async())
        except KeyboardInterrupt:
            logger.info("Received interrupt signal")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the voice assistant"""
        self.running = False
        self.rpc.disconnect()
        if self.loop:
            self.loop.close()
        logger.info("Voice Assistant stopped")
    
    def update_voice_status(self, status: Dict[str, Any]):
        """Update the current voice status (called from external source)"""
        self.rpc.current_status.update(status)


def main():
    """Main entry point"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🎤 CRY-NO-AI Voice Assistant v2.0                       ║
    ║   Discord Rich Presence Integration                       ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    # Check dependencies
    missing = []
    if not PYPRESENCE_AVAILABLE:
        missing.append("pypresence")
    if not WEBSOCKETS_AVAILABLE:
        missing.append("websockets")
    if not AIOHTTP_AVAILABLE:
        missing.append("aiohttp")
    
    if missing:
        print(f"⚠️  Missing packages: {', '.join(missing)}")
        print(f"   Install with: pip install {' '.join(missing)}")
        if not PYPRESENCE_AVAILABLE:
            print("\n❌ pypresence is required. Exiting.")
            sys.exit(1)
    
    # Start the assistant
    assistant = VoiceAssistant()
    assistant.run()


if __name__ == "__main__":
    main()
