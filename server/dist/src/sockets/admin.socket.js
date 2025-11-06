"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const players_query_1 = require("../db/queries/players.query");
const game_query_1 = require("../db/queries/game.query");
exports.default = (io, socket) => {
    socket.on("admin_join_room", async ({ gameId }) => {
        console.log(`Admin socket ${socket.id} joined room ${gameId}`);
        socket.join(gameId);
        const playersData = await (0, players_query_1.getPlayers)({ gameId });
        const playerNames = playersData.map((p) => ({ id: p.id, name: p.name }));
        const { status } = await (0, game_query_1.getGameById)({ gameId });
        socket.emit("game_status_update", { status });
        socket.emit("players_update", playerNames);
    });
    socket.on("admin_update_game_status", async ({ gameId, status }) => {
        if (status == "instructions") {
            const playersInGame = await (0, game_query_1.getPlayersInGame)({ gameId });
            if (!playersInGame.length) {
                socket.emit("no_players_in_game");
                return;
            }
        }
        const { status: updatedStatus } = await (0, game_query_1.updateGameStatus)({
            gameId,
            status,
        });
        io.to(gameId).emit("game_status_update", { status: updatedStatus });
    });
    socket.on("admin_create_new_round", async ({ gameId }) => {
        const currentRound = await (0, game_query_1.getCurrentRound)({ gameId });
        let roundNumber = 0;
        if (currentRound) {
            roundNumber = currentRound.roundNumber;
        }
        const roundDetails = await (0, game_query_1.createNewRound)({
            gameId,
            lastRound: roundNumber,
        });
        io.to(gameId).emit("game_round_updated", { roundDetails });
    });
    socket.on("admin_end_game", async ({ gameId }) => {
        const gameDetails = await (0, game_query_1.endGame)({ gameId });
        io.to(gameId).emit("game_ended", { gameId: gameDetails.id });
    });
    socket.on("admin_update_voting_status", async ({ gameId, roundId, status }) => {
        const { isVotingFinished } = await (0, game_query_1.updateRoundVoting)({
            roundId,
            isVotingFinished: status,
        });
        io.to(gameId).emit("round_voting_status_update", {
            isVotingFinished: isVotingFinished,
        });
    });
    socket.on("admin_remove_player_from_game", async ({ gameId, playerId }) => {
        await (0, players_query_1.removePlayerFromGame)({ gameId, playerId });
        const updatedPlayers = await (0, players_query_1.getPlayers)({ gameId });
        const playerNames = updatedPlayers.map((p) => ({ id: p.id, name: p.name }));
        io.to(gameId).emit("players_update", playerNames);
        io.to(gameId).emit("player_removed_from_game", { playerId });
        if (playerNames.length == 0) {
            const game = await (0, game_query_1.getGameById)({ gameId });
            if (game) {
                if (game.status !== "waiting") {
                    const deletedGame = await (0, game_query_1.deleteGameById)({ gameId });
                    if (deletedGame) {
                        io.to(gameId).emit("game_deleted");
                    }
                }
            }
        }
    });
};
