import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useDecisionStore } from "@/app/store/decisionStore";
import { useGameStore } from "@/app/store/gameStore";

export const useDecisionSocket = ({ gameId }: { gameId: string | null }) => {
  const setHasVoted = useDecisionStore((s) => s.setHasVoted);
  const setVotes = useDecisionStore((s) => s.setVotes); // add as needed
  const setRoundDetails = useGameStore((s) => s.setRoundDetails); // add as needed

  useEffect(() => {
    if (!gameId) return;

    if (!socket.connected) socket.connect();

    // socket.emit("join_game", { gameId });

    socket.on("vote_update", ({ totalVotes, playerId }) => {
      // setHasVoted(true);
      const id = localStorage.getItem("playerId");
      if (id == playerId) {
        setHasVoted(true);
      }
      setVotes(totalVotes);
    });

    socket.on("voting_complete", ({ roundData }) => {
      setRoundDetails(roundData);
    });

    return () => {
      socket.emit("leave_game", { gameId });
      socket.off("vote_update", setHasVoted);
    };
  }, [gameId, setHasVoted, setVotes, setRoundDetails]);
};
