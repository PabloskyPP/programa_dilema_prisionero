import { Server, Socket } from "socket.io";
import {
  addPlayerToGame,
  getPlayerBySocketId,
  getPlayerGames,
  getPlayers,
  insertPlayer,
  reconnectPlayer,
  removePlayerFromGame,
} from "../db/queries/players.query";
import { getGameById } from "../db/queries/game.query";

async function handleJoinGame({
  gameId,
  playerName,
  io,
  socket,
}: {
  gameId: string;
  playerName: string;
  io: Server;
  socket: Socket;
}) {
  try {
    socket.join(gameId);
    const { id } = await insertPlayer({
      playerName,
      gameId,
      socketId: socket.id,
    });
    socket.emit("new_player_joined", { id });
    const allPlayers = await getPlayers({ gameId });
    io.to(gameId).emit(
      "players_update",
      allPlayers.map((row) => ({ name: row.name, id: row.id }))
    );
    const { status } = await getGameById({ gameId });
    socket.emit("game_status_update", { status });
  } catch (err) {
    console.error("DB error on join_game:", err);
  }
}
export default (io: Server, socket: Socket) => {
  socket.on(
    "join_game",
    async ({ gameId, playerName }: { gameId: string; playerName: string }) => {
      try {
        // Join the socket room
        socket.join(gameId);

        // Insert player into DB
        const { id } = await insertPlayer({
          playerName,
          gameId,
          socketId: socket.id,
        });
        socket.emit("new_player_joined", { id });
        const allPlayers = await getPlayers({ gameId });

        // Emit updated player list to all clients in the room
        io.to(gameId).emit(
          "players_update",
          allPlayers.map((row) => ({ name: row.name, id: row.id }))
        );
        //   io.to(gameId).emit(
        //   "players_update",
        //   allPlayers.map((row) => row.name)
        // );

        const { status } = await getGameById({ gameId });

        socket.emit("game_status_update", { status: status });
      } catch (err) {
        console.error("DB error on join_game:", err);
      }
    }
  );

  socket.on(
    "join_new_game",
    async ({ gameId, playerId }: { gameId: string; playerId: number }) => {
      try {
        // Join the socket room
        socket.join(gameId);

        // Insert player into DB
        const { playerId: id } = await addPlayerToGame({
          playerId,
          gameId,
          socketId: socket.id,
        });
        socket.emit("new_player_joined", { id });
        const allPlayers = await getPlayers({ gameId });

        // Emit updated player list to all clients in the room
        io.to(gameId).emit(
          "players_update",
          allPlayers.map((row) => ({ name: row.name, id: row.id }))
        );

        const { status } = await getGameById({ gameId });

        socket.emit("game_status_update", { status: status });
      } catch (err) {
        console.error("DB error on join_game:", err);
      }
    }
  );

  socket.on(
    "reconnect_player",
    async ({
      gameId,
      playerId,
      playerName,
    }: {
      gameId: string;
      playerId: string;
      playerName: string;
    }) => {
      try {
        socket.join(gameId);
        const playerIdInt = parseInt(playerId);
        const player = await reconnectPlayer({
          playerId: playerIdInt,
          socketId: socket.id,
        });

        if (!player) {
          if (playerName)
            await handleJoinGame({ gameId, io, playerName, socket });
          else socket.emit("player_name_missing");
          return;
        }

        socket.emit("new_player_joined", { id: player.id });
        const allPlayers = await getPlayers({ gameId });

        // Emit updated player list to all clients in the room
        io.to(gameId).emit(
          "players_update",
          allPlayers.map((row) => ({ name: row.name, id: row.id }))
        );

        const { status } = await getGameById({ gameId });

        socket.emit("game_status_update", { status: status });
      } catch (err) {
        console.error("DB error on join_game:", err);
      }
    }
  );

  socket.on("disconnect", async () => {
    try {
      const playerData = await getPlayerBySocketId({ socketId: socket.id });

      if (!playerData) return;

      const playerId = playerData.id;
      const gamesOfPlayer = await getPlayerGames({ playerId });

      for (const gameLink of gamesOfPlayer) {
        const gameId = gameLink.gameId;

        const { status } = await getGameById({ gameId });
        if (status !== "waiting") continue;

        await removePlayerFromGame({ gameId, playerId });

        // Fetch updated players list for this game
        const updatedPlayers = await getPlayers({ gameId });
        const playerNames = updatedPlayers.map((p) => ({
          id: p.id,
          name: p.name,
        }));

        io.to(gameId).emit("players_update", playerNames);
      }

      // After removing player from all games with status "waiting",
      // check if player is still linked to any games
      const remainingGames = await getPlayerGames({ playerId });
      // if (remainingGames.length === 0) {
      //   await deletePlayerBySocketId({ socketId: socket.id });
      //   console.log(
      //     `Deleted player with socketId ${socket.id} because no remaining games`
      //   );
      // }

      // console.log(`Socket disconnected and removed from DB: ${socket.id}`);
    } catch (err) {
      console.error("DB error on disconnect:", err);
    }
  });
};
