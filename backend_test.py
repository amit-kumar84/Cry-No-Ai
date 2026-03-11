#!/usr/bin/env python3
"""
Discord Voice Assistant Backend API Testing
Tests all API endpoints and WebSocket functionality
"""

import requests
import json
import sys
import asyncio
import websockets
from datetime import datetime
from typing import Dict, Any, Optional

class DiscordVoiceAssistantTester:
    def __init__(self, base_url: str = "https://aichat-27.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def test_api_root(self) -> bool:
        """Test /api/ endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_fields = ["message", "discord_available"]
                has_fields = all(field in data for field in expected_fields)
                if has_fields:
                    self.log_test("API Root Endpoint", True, f"Message: {data.get('message')}, Discord Available: {data.get('discord_available')}")
                    return True
                else:
                    self.log_test("API Root Endpoint", False, f"Missing expected fields. Got: {data}")
                    return False
            else:
                self.log_test("API Root Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_status_endpoint(self) -> bool:
        """Test /api/status endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/status", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Check for expected status fields
                expected_fields = ["user_id", "username", "status", "voice_state", "is_in_vc"]
                has_fields = all(field in data for field in expected_fields)
                if has_fields:
                    self.log_test("Status Endpoint", True, f"Status: {data.get('status')}, Voice State: {data.get('voice_state')}")
                    return True
                else:
                    self.log_test("Status Endpoint", False, f"Missing expected fields. Got: {list(data.keys())}")
                    return False
            else:
                self.log_test("Status Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Status Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_config_endpoint(self) -> bool:
        """Test /api/config endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/config", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Check for expected config fields (updated based on actual response)
                expected_fields = ["app_name", "update_interval"]
                has_fields = all(field in data for field in expected_fields)
                if has_fields:
                    self.log_test("Config Endpoint", True, f"App: {data.get('app_name')}, Update Interval: {data.get('update_interval')}")
                    return True
                else:
                    self.log_test("Config Endpoint", False, f"Missing expected fields. Got: {list(data.keys())}")
                    return False
            else:
                self.log_test("Config Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Config Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_bot_status_endpoint(self) -> bool:
        """Test /api/bot/status endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/bot/status", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Check for expected bot status fields
                expected_fields = ["running", "discord_available", "connected_clients"]
                has_fields = all(field in data for field in expected_fields)
                if has_fields:
                    self.log_test("Bot Status Endpoint", True, f"Running: {data.get('running')}, Discord Available: {data.get('discord_available')}, Clients: {data.get('connected_clients')}")
                    return True
                else:
                    self.log_test("Bot Status Endpoint", False, f"Missing expected fields. Got: {list(data.keys())}")
                    return False
            else:
                self.log_test("Bot Status Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Bot Status Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_status_update_endpoint(self) -> bool:
        """Test POST /api/status/update endpoint"""
        try:
            test_status = {
                "user_id": "test_user_123",
                "username": "TestUser",
                "status": "online",
                "voice_state": "listening",
                "is_in_vc": True,
                "server_name": "Test Server",
                "channel_name": "General"
            }
            
            response = requests.post(
                f"{self.base_url}/api/status/update", 
                json=test_status,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get("success"):
                    self.log_test("Status Update Endpoint", True, f"Message: {data.get('message')}")
                    return True
                else:
                    self.log_test("Status Update Endpoint", False, f"Success field is False: {data}")
                    return False
            else:
                self.log_test("Status Update Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Status Update Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_config_update_endpoint(self) -> bool:
        """Test POST /api/config endpoint"""
        try:
            test_config = {
                "app_name": "Test Voice Assistant",
                "update_interval": 15
            }
            
            response = requests.post(
                f"{self.base_url}/api/config", 
                json=test_config,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get("success"):
                    self.log_test("Config Update Endpoint", True, f"Message: {data.get('message')}")
                    return True
                else:
                    self.log_test("Config Update Endpoint", False, f"Success field is False: {data}")
                    return False
            else:
                self.log_test("Config Update Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Config Update Endpoint", False, f"Exception: {str(e)}")
            return False

    async def test_websocket_connection(self) -> bool:
        """Test WebSocket /api/ws endpoint"""
        try:
            ws_url = self.base_url.replace('https://', 'wss://').replace('http://', 'ws://') + '/api/ws'
            
            async with websockets.connect(ws_url) as websocket:
                # Test connection
                print("WebSocket connected successfully")
                
                # Send ping
                await websocket.send(json.dumps({"type": "ping"}))
                
                # Wait for response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5)
                    data = json.loads(response)
                    
                    # Should receive either pong or status data
                    if data.get("type") == "pong" or "user_id" in data:
                        self.log_test("WebSocket Connection", True, "Successfully connected and received data")
                        return True
                    else:
                        self.log_test("WebSocket Connection", False, f"Unexpected response: {data}")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log_test("WebSocket Connection", False, "Timeout waiting for response")
                    return False
                    
        except Exception as e:
            self.log_test("WebSocket Connection", False, f"Exception: {str(e)}")
            return False

    def test_history_endpoint(self) -> bool:
        """Test /api/history endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/history?limit=10", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("History Endpoint", True, f"Retrieved {len(data)} history records")
                    return True
                else:
                    self.log_test("History Endpoint", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("History Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("History Endpoint", False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Discord Voice Assistant Backend Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test REST API endpoints
        self.test_api_root()
        self.test_status_endpoint()
        self.test_config_endpoint()
        self.test_bot_status_endpoint()
        self.test_status_update_endpoint()
        self.test_config_update_endpoint()
        self.test_history_endpoint()
        
        # Test WebSocket
        await self.test_websocket_connection()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

    def get_test_results(self) -> Dict[str, Any]:
        """Get detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "results": self.test_results
        }

async def main():
    """Main test runner"""
    tester = DiscordVoiceAssistantTester()
    success = await tester.run_all_tests()
    
    # Save detailed results
    results = tester.get_test_results()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))