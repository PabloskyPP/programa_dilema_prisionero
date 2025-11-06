"use client";
import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useChatStore } from "@/app/store/chatStore";

// type Message = {
//   playerName: string;
//   messageText: string;
//   sentAt: string;
// };

export function ChatBox({
  roundId,
  isAdmin = false,
}: {
  roundId: number | null;
  isAdmin?: boolean;
}) {
  // const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { setMessages, messages, addMessage } = useChatStore();
  useEffect(() => {
    if (!roundId) return;
    async function fetchChat() {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + `/api/chat/${roundId}/history`
      );
      if (res.ok) {
        const chatHistory = await res.json();

        if (chatHistory) {
          setMessages(chatHistory);
        }
      }
    }
    fetchChat();
    socket.emit("join_round_chat", { roundId });

    socket.on("round_chat_message", (message) => {
      addMessage(message); // Add single message to store

      // addMessage((prev) => [...prev, message]);
    });

    return () => {
      socket.emit("leave_round_chat", { roundId });
      socket.off("round_chat_message");
    };
  }, [roundId, addMessage, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("send_round_chat_message", {
      roundId,
      messageText: input,
    });

    setInput("");
  };

  return (
    <div className="mx-8  rounded  flex flex-col gap-4 ">
      <div className="flex flex-col gap-1 h-[70vh] max-h-[400px] overflow-auto px-4 py-4 bg-gray-100 border-b-2">
        {messages.map((msg, i) => (
          <div key={i}>
            <span className="font-bold text-blue-500">
              {msg.playerName}: &nbsp;
            </span>
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          disabled={isAdmin}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Escribe tu mensaje..."
        />
        <Button onClick={sendMessage} disabled={isAdmin}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
