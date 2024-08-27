import React, { useState, useEffect, useRef } from "react";
import "remixicon/fonts/remixicon.css";
import axios from "axios";
import gsap from "gsap";

const ChatBot = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      gsap.fromTo(
        chatBoxRef.current.lastChild,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [messages]);

  const handleSend = async () => {
    if (userInput.trim() === "") return;

    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        text: userInput,
      });

      setMessages([
        ...newMessages,
        { sender: "bot", text: response.data.bot_response },
      ]);
    } catch (error) {
      console.error("Error communicating with the backend:", error);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Sorry, something went wrong!" },
      ]);
    }

    setLoading(false);
    setUserInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg shadow-lg p-4 w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-center">
        <h2 className="text-3xl font-bold text-white">Chat with BETA</h2>
      </div>
      <div
        ref={chatBoxRef}
        className="flex flex-col space-y-4 h-96 overflow-y-auto bg-zinc-700 p-3 rounded-lg scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xl px-4 py-2 rounded-lg text-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {msg.sender === "bot" && <strong>BETA: </strong>}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 rounded-lg text-sm bg-gray-300 text-gray-800">
              <strong>BETA: </strong>...
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 border bg-transparent rounded-lg focus:outline-none text-white"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-gray-500 text-white px-4 py-3 rounded-full hover:bg-gray-600"
        >
          <i className="ri-arrow-up-line text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
