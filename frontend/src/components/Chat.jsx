import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

// ✅ Stable socket connection
const socket = io(import.meta.env.VITE_SERVER_URL, { transports: ["websocket"] });

export default function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [aiTyping, setAiTyping] = useState(false); 
  const chatContainerRef = useRef(null);

  // ✅ Fetch chat history on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return console.error("No token found");

        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/chat/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    fetchChatHistory();
  }, []);

  // ✅ Auto scroll when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, aiTyping]);

  // ✅ Socket listener for AI replies
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setAiTyping(false); 
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  // ✅ Send user message
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setAiTyping(true);

    const token = localStorage.getItem("token");
    socket.emit("sendMessage", { token, text: userMsg.text });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // 🎤 Voice input
  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => setInput(event.results[0][0].transcript);

    recognition.start();
  };

  // 🗣️ Text-to-Speech for AI reply
  const speakText = (text) => {
    if (!window.speechSynthesis || speaking) return;

    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onend = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopVoice = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  // ✅ Format AI message nicely
  const formatAIMessage = (text) => {
    return text.split("\n").map((line, i) => (
      <div key={i} className="my-1">
        {line.startsWith("1.") ? <strong>{line}</strong> : line}
      </div>
    ));
  };

  return (
    <div className="flex flex-col max-w-md mx-auto max-h-screen bg-gray-50 shadow-lg rounded-lg overflow-hidden mt-4">
      {/* Header */}
      <div className="bg-blue-600 text-white text-center py-3 font-semibold">
        VishAI: talk to me
      </div>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 pb-12 overflow-y-auto space-y-3"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-[80%] relative ${
                m.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.sender === "ai" ? formatAIMessage(m.text) : m.text}

              {/* 🗣️ AI voice button (keep original style) */}
              {m.sender === "ai" && (
                <button
                  onClick={() => (speaking ? stopVoice() : speakText(m.text))}
                  className="absolute -bottom-6 left-0 text-blue-600 hover:text-blue-800 text-sm"
                  title={speaking ? "Stop AI Voice" : "Play AI Voice"}
                >
                  {speaking ? "🔇 Stop" : "🔊 Listen"}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {aiTyping && (
          <div className="flex justify-start mb-2">
            <div className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-800 max-w-[50%] animate-pulse">
              AI is typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t flex items-center gap-2 bg-white">
        <button
          onClick={startVoiceInput}
          className={`px-3 py-2 rounded-full ${listening ? "bg-green-500" : "bg-gray-200"}`}
          title="Speak"
        >
          🎤
        </button>

        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
          placeholder="Type or speak your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
