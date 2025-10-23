import axios from 'axios';
import { io } from 'socket.io-client';

// Normalize base URL (remove trailing slash if present)
const BASE_URL = (import.meta.env.VITE_SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');

// Create axios instance with default config
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create socket connection with proper config
export const createSocket = () => {
  const socket = io(BASE_URL, {
    path: '/socket.io/',
    transports: ['polling', 'websocket'], // Try polling first
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    timeout: 20000,
    autoConnect: false, // Manual connection for better control
    withCredentials: true,
    auth: {
      token: localStorage.getItem('token')
    },
    forceNew: true,
    extraHeaders: {
      "User-Agent": "VisAI-Client"
    }
  });

  // Enhanced connection handling
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    // If websocket fails, try polling
    if (socket.io.opts.transports.includes('websocket')) {
      console.log('Falling back to polling transport');
      socket.io.opts.transports = ['polling'];
      socket.connect();
    }
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Reconnect if server initiated disconnect
      socket.connect();
    }
  });

  // Attempt connection
  socket.connect();
  
  return socket;
};

// Auth endpoints
export const auth = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout')
};

// Chat endpoints
export const chat = {
  getHistory: () => api.get('/api/chat/history'),
  sendMessage: (text) => api.post('/api/chat/message', { text })
};
