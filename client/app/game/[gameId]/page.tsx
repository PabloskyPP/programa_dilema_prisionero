"use client";
import { useGameStore } from "@/app/store/gameStore";
import { usePlayersStore } from "@/app/store/playerStore";
import GameUI from "@/components/GameUI";
import InstructionsScreen from "@/components/InstructionsScreen";
import PlayerWaitingPage from "@/components/PlayerWaitingPage";
import { useGameSocket } from "@/hooks/useGameSocket";
import { usePlayersSocket } from "@/hooks/usePlayerSocket";
import { Loader2Icon } from "lucide-react";
// import { ResultsTable } from "@/components/ResultsTable";
import { use, useEffect, useState } from "react";

const GamePage = ({ params }: { params: Promise<{ gameId: string }> }) => {
  const { gameId } = use(params);
  const { status, setStatus } = useGameStore();
  const [playerIsInGame, setPlayerIsInGame] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loaded2, setLoaded2] = useState(false);
  usePlayersSocket({ gameId });
  const { hasLoaded } = usePlayersStore();
  useEffect(() => {
    async function fetchCurrentRound() {
      if (!gameId) return;

      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + `/api/game/${gameId}/game-status`
      );

      if (res.ok) {
        const { status } = await res.json();

        if (status) {
          setStatus(status);
        }
      }
      setLoaded(true);
    }

    fetchCurrentRound();
  }, [setStatus, gameId]);

  useEffect(() => {
    const playerId = localStorage.getItem("playerId");
    async function fetchPlayerInGame() {
      if (!gameId) return;

      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + `/api/game/${gameId}/${playerId}`
      );

      if (res.ok) {
        const playerData = await res.json();
        if (playerData) {
          setPlayerIsInGame(true);
        }
      }

      setLoaded2(true);
    }

    fetchPlayerInGame();
  }, [status, gameId]);

  useGameSocket({ gameId });
  if (!hasLoaded || !loaded || !loaded2) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }
  if (status == "waiting") {
    return <PlayerWaitingPage gameId={gameId} />;
  }
  if (!playerIsInGame) {
    return (
      <div className="flex h-screen justify-center items-center font-bold text-2xl">
        El Juego Ya Ha Comenzado
      </div>
    );
  }
  if (status === "instructions") {
    return <InstructionsScreen />;
  }
  if (status === "active")
    return (
      <div>
        <GameUI gameId={gameId} />
      </div>
    );
};
export default GamePage;
