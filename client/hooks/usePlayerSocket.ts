"use client";
import { useEffect } from "react";
import { usePlayersStore } from "@/app/store/playerStore";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
export const usePlayersSocket = ({ gameId }: { gameId: string }) => {
  const addPlayer = usePlayersStore((s) => s.addPlayer);
  const setPlayers = usePlayersStore((s) => s.setPlayers);
  const { setHasJoinedGame, setHasLoaded } = usePlayersStore();
  const router = useRouter();
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const playerName = localStorage.getItem("playerName");

    const storedPlayerId = localStorage.getItem("playerId");

    if (storedPlayerId) {
      async function fetchPlayerInGame() {
        if (!gameId) return;

        const playerRes = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL +
            `/api/game/player/${storedPlayerId}`
        );
        if (playerRes.ok) {
          const playerExists = await playerRes.json();
          if (!playerExists) return;
          const res = await fetch(
            process.env.NEXT_PUBLIC_SERVER_URL +
              `/api/game/${gameId}/${storedPlayerId}`
          );

          if (res.ok) {
            const playerData = await res.json();
            if (playerData) {
              // Player is in game
              // Reconnect existing player
              socket.emit("reconnect_player", {
                playerId: storedPlayerId,
                gameId,
                playerName,
              });
            } else {
              // Player in db but not in this game

              const statusRes = await fetch(
                process.env.NEXT_PUBLIC_SERVER_URL +
                  `/api/game/${gameId}/game-status`
              );
              if (statusRes.ok) {
                const { status } = await statusRes.json();

                if (status) {
                  if (status === "waiting") {
                    // Reconnect existing player

                    socket.emit("join_new_game", {
                      playerId: storedPlayerId,
                      gameId,
                    });
                  }
                }
              }
            }
          }
        }
      }

      fetchPlayerInGame();
    } else if (playerName && !storedPlayerId) {
      // New player join
      socket.emit("join_game", { playerName, gameId });
    }

    // socket.on("players_list", (players) => setPlayers(players));
    socket.on("player_joined", (player) => addPlayer(player));
    socket.on("players_update", (playersList) => {
      setPlayers(playersList);
    });
    // socket.on("game_deleted", () => {
    //   router.push("/");
    // });
    socket.on("new_player_joined", ({ id }) => {
      setHasJoinedGame(true);
      localStorage.setItem("playerId", id);
    });

    setHasLoaded(true);
    return () => {
      socket.off("players_list");
      socket.off("player_joined");
      socket.off("players_update");
      // ⚠️ Do not disconnect here unless you're leaving the app entirely
    };
  }, [gameId, setPlayers, addPlayer, setHasJoinedGame, setHasLoaded, router]);
};
