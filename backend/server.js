const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const {Server} = require('socket.io');
const jwt = require('jsonwebtoken');


const connectDB = require('./config/db');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const chatRoutes = require('./routes/chat.route');
const handleMessage = require('./controllers/chatController');
const { generateAIReply } = require("./services/aiService");
const Chat = require("./models/chat.model");
const { verifyToken } = require('./utils/jwt');



dotenv.config();
connectDB();


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Allow configuring frontend origins via environment variable (comma-separated)
const frontendOrigins = (process.env.FRONTEND_URLS || 'http://localhost:5173,https://vishai.netlify.app,https://vish-ai.vercel.app')
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: frontendOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  cookie: {
    name: "io",
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});

// Add socket middleware error handler
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err.req.url, err.code, err.message);
});

io.engine.on("headers", (headers, req) => {
  // Log successful upgrades for debugging
  console.log("Socket headers:", req.url);
});


// Configure CORS for Express routes
app.use(cors({
  origin: frontendOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// Simple health check for debugging deployments
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
    res.json({ ok: true, dbState, env: { port: PORT } });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ ok: false, error: 'Health check failed' });
  }
});



// Socket connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

 socket.on("sendMessage", async ({ token, text }) => {
  try {
    const userId = verifyToken(token); // your function to get userId from token

    // Save user message
    const userMessage = { sender: "user", text };
    const chat = await Chat.findOne({ userId });
    chat.messages.push(userMessage);

    // Get AI reply
    const aiReply = await generateAIReply(text);
    const aiMessage = { sender: "ai", text: aiReply };
    chat.messages.push(aiMessage);

    await chat.save();

    // Emit both messages to client
    io.emit("receiveMessage", userMessage);
    io.emit("receiveMessage", aiMessage);

  } catch (err) {
    console.error("Error saving message:", err);
  }
});


  socket.on("disconnect", () => console.log("User disconnected"));
});




app.get("/", (req, res) => {
  res.send("Server is running...");
});


server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));