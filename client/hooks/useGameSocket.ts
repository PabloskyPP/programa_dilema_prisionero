import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useGameStore } from "@/app/store/gameStore";
import { useDecisionStore } from "@/app/store/decisionStore";
import { usePathname, useRouter } from "next/navigation";

export const useGameSocket = ({ gameId }: { gameId: string | null }) => {
  const setGameStatus = useGameStore((s) => s.setStatus);
  const setRoundDetails = useGameStore((s) => s.setRoundDetails);
  const { setHasVoted, setVotes } = useDecisionStore();
  const { setShowChat } = useGameStore();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (!gameId) return;

    if (!socket.connected) socket.connect();

    async function fetchVotesData() {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL + "/api/game/votes",
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch game");
        const votesData = await res.json();
        if (votesData) {
          setVotes(votesData.length);
          const playerId = localStorage.getItem("playerId");

          // @ts-expect-error ignore the error
          const hasVoted = votesData.find((x) => x.playerId == playerId);
          if (hasVoted) {
            setHasVoted(true);
            setShowChat(false);
          } else {
            setHasVoted(false);
          }
        }
      } catch (err: unknown) {
        console.log("Error :", err);
      }
    }

    fetchVotesData();

    socket.on("game_status_update", ({ status }) => setGameStatus(status));

    socket.on("game_round_updated", ({ roundDetails }) => {
      setHasVoted(false);
      setVotes(0);
      setRoundDetails(roundDetails);
      const roundNumber = roundDetails.roundNumber;
      if (roundNumber == 5 || roundNumber == 6 || roundNumber == 9) {
        console.log("No chat this round.");
      } else {
        setShowChat(true);
      }
    });

    socket.on("game_ended", ({ gameId }) => {
      router.push(`/game/${gameId}/leaderboard`);
    });
    socket.on("player_removed_from_game", ({ playerId }) => {
      if (!path.includes("admin")) {
        const id = localStorage.getItem("playerId");
        if (id == playerId) {
          router.push(`/`);
        }
      }
    });

    socket.on("game_deleted", () => {
      if (!path.includes("admin")) {
        router.push(`/`);
      } else {
        location.reload();
      }
    });

    return () => {
      socket.emit("leave_game", { gameId });
      socket.off("game_status_update");
    };
  }, [
    gameId,
    setGameStatus,
    setRoundDetails,
    setHasVoted,
    setVotes,
    setShowChat,
    router,
    path,
  ]);
};
