"use client";
import React, { useEffect, useState } from "react";
import PlayersList from "@/components/PlayersList";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import InstructionsScreen from "@/components/InstructionsScreen";
import { socket } from "@/lib/socket";
import { useGameStore } from "../store/gameStore";
import { useAdminSocket } from "@/hooks/useAdminSocket";
import { useGameSocket } from "@/hooks/useGameSocket";
import GameUIAdmin from "@/components/GameUIAdmin";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminPage = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const status = useGameStore((s) => s.status);

  useAdminSocket({ gameId });
  useGameSocket({ gameId });

  // Fetch or create game on mount
  useEffect(() => {
    async function fetchOrCreateGame() {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL + "/api/game",
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch game");
        const game = await res.json();
        setGameId(game.id);
      } catch (err: unknown) {
        //@ts-expect-error because err is not defined
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchOrCreateGame();

    socket.on("no_players_in_game", () => {
      toast.error("No players in game.");
    });
  }, []);

  if (loading)
    return (
      <div className="flex h-screen justify-center items-center">
        {/* Loading game... */}
        <Loader2 className="animate-spin" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  const handleUpdateStatus = async (status: string) => {
    socket.emit("admin_update_game_status", {
      gameId,
      status,
    });

    // Create round 1
    if (status === "active") {
      socket.emit("admin_create_new_round", { gameId });
    }
  };

  if (status === "waiting")
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <div className="flex px-8 py-8 gap-4 flex-col items-center justify-center">
          <h2 className="text-xl font-bold">Scan to join the game</h2>

          <QRCode
            className="w-[200px] h-[200px]"
            value={`${process.env.NEXT_PUBLIC_BASE_URL}/game/${gameId}`} // Example join link with gameId param
            viewBox={`0 0 256 256`}
          />

          <div>
            {process.env.NEXT_PUBLIC_BASE_URL}/game/{gameId}
          </div>

          <Button
            className="cursor-pointer"
            onClick={() => handleUpdateStatus("instructions")}
          >
            Start Game
          </Button>

          {gameId && <PlayersList gameId={gameId} />}
          {/* <PlayersList /> */}
        </div>
      </div>
    );
  if (status === "instructions")
    return (
      <InstructionsScreen
        isAdmin={true}
        handleUpdateStatus={() => {
          handleUpdateStatus("active");
        }}
      />
    );

  if (status === "active" && gameId)
    return (
      <div>
        {/* <ResultsTable /> */}
        <GameUIAdmin gameId={gameId} />
      </div>
    );
  // && showResult
  // if (status === "active") {
  //   return <ResultsTable />;
  // }
};

export default AdminPage;
