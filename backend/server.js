const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const {Server} = require('socket.io');
const jwt = require('jsonwebtoken');


const connectDB = require('./config/db');
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
    methods: ["GET", "POST"],
  },
});


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);



// Socket connection
io.on("connection", (socket) => {
  console.log("User connected");

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