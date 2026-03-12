import { useState, useEffect, useCallback, useRef } from 'react';

const normalizeBaseUrl = (url) => url.trim().replace(/\/+$/, '');

// Get backend URL from environment variable
const BACKEND_URL = normalizeBaseUrl(process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001');

// Convert HTTP to WebSocket URL
const getWebSocketUrl = (httpUrl) => {
  return normalizeBaseUrl(httpUrl)
    .replace('https://', 'wss://')
    .replace('http://', 'ws://');
};

const WS_URL = getWebSocketUrl(BACKEND_URL);

const DEFAULT_STATUS = {
  user_id: '',
  username: 'Connecting...',
  discriminator: '0',
  avatar_url: '',
  status: 'offline',
  voice_state: 'none',
  is_in_vc: false,
  server_name: '',
  server_id: '',
  server_member_count: 0,
  channel_name: '',
  channel_id: '',
  channel_member_count: 0,
  is_muted: false,
  is_deafened: false,
  is_self_muted: false,
  is_self_deafened: false,
  is_streaming: false,
  is_video: false,
  timestamp: new Date().toISOString()
};

export const useDiscordStatus = () => {
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      console.log(`Connecting to WebSocket: ${WS_URL}/api/ws`);
      const ws = new WebSocket(`${WS_URL}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000); // Ping every 25 seconds
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            return; // Ignore pong messages
          }
          setStatus(prevStatus => ({
            ...prevStatus,
            ...data
          }));
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setConnected(false);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        
        // Exponential backoff for reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Max reconnection attempts reached. Please refresh the page.');
        }
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      setError('Failed to connect');
      
      // Retry connection
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, []);

  // Fallback to REST polling if WebSocket fails
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(prevStatus => ({
          ...prevStatus,
          ...data
        }));
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  }, []);

  useEffect(() => {
    connect();
    
    // Also fetch initial status via REST
    fetchStatus();
    
    // Fallback polling every 10 seconds if WebSocket is not connected
    const pollInterval = setInterval(() => {
      if (!connected) {
        fetchStatus();
      }
    }, 10000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      clearInterval(pollInterval);
    };
  }, [connect, fetchStatus, connected]);

  return { status, connected, error };
};
