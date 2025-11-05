import { Server, Socket } from "socket.io";
import {
  getPlayerInGame,
  getPlayers,
  removePlayerFromGame,
} from "../db/queries/players.query";
import {
  createNewRound,
  deleteGameById,
  endGame,
  getCurrentRound,
  getGameById,
  getPlayersInGame,
  updateGameStatus,
  updateRoundVoting,
} from "../db/queries/game.query";

export default (io: Server, socket: Socket) => {
  socket.on("admin_join_room", async ({ gameId }) => {
    console.log(`Admin socket ${socket.id} joined room ${gameId}`);

    socket.join(gameId);

    const playersData = await getPlayers({ gameId });
    const playerNames = playersData.map((p) => ({ id: p.id, name: p.name }));

    const { status } = await getGameById({ gameId });
    socket.emit("game_status_update", { status });

    socket.emit("players_update", playerNames);
  });

  socket.on("admin_update_game_status", async ({ gameId, status }) => {
    if (status == "instructions") {
      const playersInGame = await getPlayersInGame({ gameId });
      if (!playersInGame.length) {
        socket.emit("no_players_in_game");
        return;
      }
    }

    const { status: updatedStatus } = await updateGameStatus({
      gameId,
      status,
    });

    io.to(gameId).emit("game_status_update", { status: updatedStatus });
  });

  socket.on("admin_create_new_round", async ({ gameId }) => {
    const currentRound = await getCurrentRound({ gameId });
    let roundNumber = 0;
    if (currentRound) {
      roundNumber = currentRound.roundNumber;
    }
    const roundDetails = await createNewRound({
      gameId,
      lastRound: roundNumber,
    });
    io.to(gameId).emit("game_round_updated", { roundDetails });
  });
  socket.on("admin_end_game", async ({ gameId }) => {
    const gameDetails = await endGame({ gameId });

    io.to(gameId).emit("game_ended", { gameId: gameDetails.id });
  });

  socket.on(
    "admin_update_voting_status",
    async ({ gameId, roundId, status }) => {
      const { isVotingFinished } = await updateRoundVoting({
        roundId,
        isVotingFinished: status,
      });

      io.to(gameId).emit("round_voting_status_update", {
        isVotingFinished: isVotingFinished,
      });
    }
  );

  socket.on("admin_remove_player_from_game", async ({ gameId, playerId }) => {
    await removePlayerFromGame({ gameId, playerId });

    const updatedPlayers = await getPlayers({ gameId });
    const playerNames = updatedPlayers.map((p) => ({ id: p.id, name: p.name }));

    io.to(gameId).emit("players_update", playerNames);
    io.to(gameId).emit("player_removed_from_game", { playerId });
    if (playerNames.length == 0) {
      const game = await getGameById({ gameId });
      if (game) {
        if (game.status !== "waiting") {
          const deletedGame = await deleteGameById({ gameId });
          if (deletedGame) {
            io.to(gameId).emit("game_deleted");
          }
        }
      }
    }
  });
};
