"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const players_query_1 = require("../db/queries/players.query");
const game_query_1 = require("../db/queries/game.query");
async function handleJoinGame({ gameId, playerName, io, socket, }) {
    try {
        socket.join(gameId);
        const { id } = await (0, players_query_1.insertPlayer)({
            playerName,
            gameId,
            socketId: socket.id,
        });
        socket.emit("new_player_joined", { id });
        const allPlayers = await (0, players_query_1.getPlayers)({ gameId });
        io.to(gameId).emit("players_update", allPlayers.map((row) => ({ name: row.name, id: row.id })));
        const { status } = await (0, game_query_1.getGameById)({ gameId });
        socket.emit("game_status_update", { status });
    }
    catch (err) {
        console.error("DB error on join_game:", err);
    }
}
exports.default = (io, socket) => {
    socket.on("join_game", async ({ gameId, playerName }) => {
        try {
            // Join the socket room
            socket.join(gameId);
            // Insert player into DB
            const { id } = await (0, players_query_1.insertPlayer)({
                playerName,
                gameId,
                socketId: socket.id,
            });
            socket.emit("new_player_joined", { id });
            const allPlayers = await (0, players_query_1.getPlayers)({ gameId });
            // Emit updated player list to all clients in the room
            io.to(gameId).emit("players_update", allPlayers.map((row) => ({ name: row.name, id: row.id })));
            //   io.to(gameId).emit(
            //   "players_update",
            //   allPlayers.map((row) => row.name)
            // );
            const { status } = await (0, game_query_1.getGameById)({ gameId });
            socket.emit("game_status_update", { status: status });
        }
        catch (err) {
            console.error("DB error on join_game:", err);
        }
    });
    socket.on("join_new_game", async ({ gameId, playerId }) => {
        try {
            // Join the socket room
            socket.join(gameId);
            // Insert player into DB
            const { playerId: id } = await (0, players_query_1.addPlayerToGame)({
                playerId,
                gameId,
                socketId: socket.id,
            });
            socket.emit("new_player_joined", { id });
            const allPlayers = await (0, players_query_1.getPlayers)({ gameId });
            // Emit updated player list to all clients in the room
            io.to(gameId).emit("players_update", allPlayers.map((row) => ({ name: row.name, id: row.id })));
            const { status } = await (0, game_query_1.getGameById)({ gameId });
            socket.emit("game_status_update", { status: status });
        }
        catch (err) {
            console.error("DB error on join_game:", err);
        }
    });
    socket.on("reconnect_player", async ({ gameId, playerId, playerName, }) => {
        try {
            socket.join(gameId);
            const playerIdInt = parseInt(playerId);
            const player = await (0, players_query_1.reconnectPlayer)({
                playerId: playerIdInt,
                socketId: socket.id,
            });
            if (!player) {
                if (playerName)
                    await handleJoinGame({ gameId, io, playerName, socket });
                else
                    socket.emit("player_name_missing");
                return;
            }
            socket.emit("new_player_joined", { id: player.id });
            const allPlayers = await (0, players_query_1.getPlayers)({ gameId });
            // Emit updated player list to all clients in the room
            io.to(gameId).emit("players_update", allPlayers.map((row) => ({ name: row.name, id: row.id })));
            const { status } = await (0, game_query_1.getGameById)({ gameId });
            socket.emit("game_status_update", { status: status });
        }
        catch (err) {
            console.error("DB error on join_game:", err);
        }
    });
    socket.on("disconnect", async () => {
        try {
            const playerData = await (0, players_query_1.getPlayerBySocketId)({ socketId: socket.id });
            if (!playerData)
                return;
            const playerId = playerData.id;
            const gamesOfPlayer = await (0, players_query_1.getPlayerGames)({ playerId });
            for (const gameLink of gamesOfPlayer) {
                const gameId = gameLink.gameId;
                const { status } = await (0, game_query_1.getGameById)({ gameId });
                if (status !== "waiting")
                    continue;
                await (0, players_query_1.removePlayerFromGame)({ gameId, playerId });
                // Fetch updated players list for this game
                const updatedPlayers = await (0, players_query_1.getPlayers)({ gameId });
                const playerNames = updatedPlayers.map((p) => ({
                    id: p.id,
                    name: p.name,
                }));
                io.to(gameId).emit("players_update", playerNames);
            }
            // After removing player from all games with status "waiting",
            // check if player is still linked to any games
            const remainingGames = await (0, players_query_1.getPlayerGames)({ playerId });
            // if (remainingGames.length === 0) {
            //   await deletePlayerBySocketId({ socketId: socket.id });
            //   console.log(
            //     `Deleted player with socketId ${socket.id} because no remaining games`
            //   );
            // }
            // console.log(`Socket disconnected and removed from DB: ${socket.id}`);
        }
        catch (err) {
            console.error("DB error on disconnect:", err);
        }
    });
};
