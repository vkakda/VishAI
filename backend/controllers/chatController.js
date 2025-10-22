const { generateAIReply } = require('../services/aiService');

exports.handleMessage = async (socket, data) => {
  const { userId, text } = data;

  // Save user message to database (implement as needed)
  // const userMsg = await saveUserMessage(userId, text);

  // Generate AI reply
  const aiText = await generateAIReply(text);

  // Save AI reply to database (implement as needed)
  // const aiMsg = await saveAIMessage(userId, aiText);

  // Emit AI reply back to the client
  socket.emit('receiveMessage', { sender: 'ai', text: aiText });
};
