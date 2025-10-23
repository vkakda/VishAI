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
const PORT = process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173','https://vishai.netlify.app/' ],
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


server.listen(5000, () => console.log("✅ Server running on port 5000"));