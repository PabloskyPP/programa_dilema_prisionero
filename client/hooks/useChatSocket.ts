import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useChatStore } from "@/app/store/chatStore";

export const useChatSocket = () => {
  const addMessage = useChatStore((s) => s.addMessage);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("new_message", addMessage);

    return () => {
      socket.off("new_message", addMessage);
    };
  }, [addMessage]);
};
