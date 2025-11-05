// hooks/useSocket.ts
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { usePlayersStore } from "@/app/store/playerStore";
import { useGameStore } from "@/app/store/gameStore";
import { useChatStore } from "@/app/store/chatStore";
import { useDecisionStore } from "@/app/store/decisionStore";

export const useSocket = () => {
  const setPlayers = usePlayersStore((s) => s.setPlayers);
  const setGameStatus = useGameStore((s) => s.setStatus);
  const addMessage = useChatStore((s) => s.addMessage);
  const setHasVoted = useDecisionStore((s) => s.setHasVoted);
  //   const setVotes = useDecisionStore((s) => s.setVotes);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Register listeners for all store-related events
    socket.on("players_update", setPlayers);
    socket.on("game_status_update", ({ status }) => setGameStatus(status));
    socket.on("new_message", addMessage);
    socket.on("decision_update", setHasVoted); // example

    return () => {
      // Cleanup listeners
      socket.off("players_update", setPlayers);
      socket.off("game_status_update");
      socket.off("new_message", addMessage);
      socket.off("decision_update", setHasVoted);
    };
  }, [setPlayers, setGameStatus, addMessage, setHasVoted]);

  return socket;
};
