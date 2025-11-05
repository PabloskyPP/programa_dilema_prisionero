import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useGameStore } from "@/app/store/gameStore";
import { usePlayersStore } from "@/app/store/playerStore";
import { useDecisionStore } from "@/app/store/decisionStore";

export const useAdminSocket = ({ gameId }: { gameId: string | null }) => {
  const setGameStatus = useGameStore((s) => s.setStatus);
  const setPlayers = usePlayersStore((s) => s.setPlayers);
  const { setVotes } = useDecisionStore();

  useEffect(() => {
    if (!gameId) return;

    if (!socket.connected) socket.connect();

    socket.emit("admin_join_room", { gameId });

    socket.on("players_update", (players) => {
      setPlayers(players);
    });
    socket.on("game_round_updated", () => {
      setVotes(0);
    });

    // Add other admin-specific event listeners here

    return () => {
      socket.emit("admin_leave_room", { gameId });
      socket.off("game_status_update");
      socket.off("players_update");
      // Remove other admin listeners here
    };
  }, [gameId, setGameStatus, setPlayers, setVotes]);
};
