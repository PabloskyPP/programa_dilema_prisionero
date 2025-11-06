"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePlayerFromGame = exports.getPlayerGames = exports.getPlayerInGame = exports.deletePlayerBySocketId = exports.getPlayerBySocketId = exports.reconnectPlayer = exports.addPlayerToGame = exports.insertPlayer = exports.getPlayerById = exports.getPlayers = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const __1 = require("..");
const schema_1 = require("../schema");
const game_query_1 = require("./game.query");
const getPlayers = async ({ gameId }) => {
    const playersData = await __1.db
        .select()
        .from(schema_1.gamePlayers)
        .where((0, drizzle_orm_1.eq)(schema_1.gamePlayers.gameId, gameId))
        .innerJoin(schema_1.players, (0, drizzle_orm_1.eq)(schema_1.gamePlayers.playerId, schema_1.players.id))
        .orderBy((0, drizzle_orm_1.asc)(schema_1.players.id));
    // Optional: Return just the player data, not join metadata
    return playersData.map((row) => row.players);
};
exports.getPlayers = getPlayers;
const getPlayerById = async ({ id }) => {
    const [playerData] = await __1.db
        .select()
        .from(schema_1.players)
        .where((0, drizzle_orm_1.eq)(schema_1.players.id, id))
        .limit(1);
    return playerData;
};
exports.getPlayerById = getPlayerById;
const insertPlayer = async ({ gameId, playerName, socketId, }) => {
    const [player] = await __1.db
        .insert(schema_1.players)
        .values({
        name: playerName,
        socketId,
    })
        .returning();
    // Step 2: Link player to game
    await __1.db.insert(schema_1.gamePlayers).values({
        gameId,
        playerId: player.id,
    });
    return player;
};
exports.insertPlayer = insertPlayer;
const addPlayerToGame = async ({ gameId, playerId, socketId, }) => {
    const [player] = await __1.db
        .insert(schema_1.gamePlayers)
        .values({
        gameId,
        playerId,
    })
        .returning();
    await (0, exports.reconnectPlayer)({ playerId, socketId });
    return player;
};
exports.addPlayerToGame = addPlayerToGame;
const reconnectPlayer = async ({ playerId, socketId, }) => {
    const [data] = await __1.db
        .update(schema_1.players)
        .set({
        socketId,
    })
        .where((0, drizzle_orm_1.eq)(schema_1.players.id, playerId))
        .returning();
    return data;
};
exports.reconnectPlayer = reconnectPlayer;
const getPlayerBySocketId = async ({ socketId, }) => {
    const [playerData] = await __1.db
        .select()
        .from(schema_1.players)
        .where((0, drizzle_orm_1.eq)(schema_1.players.socketId, socketId))
        .limit(1);
    return playerData;
};
exports.getPlayerBySocketId = getPlayerBySocketId;
const deletePlayerBySocketId = async ({ socketId, }) => {
    await __1.db.delete(schema_1.players).where((0, drizzle_orm_1.eq)(schema_1.players.socketId, socketId));
};
exports.deletePlayerBySocketId = deletePlayerBySocketId;
const getPlayerInGame = async ({ gameId, playerId, }) => {
    const [link] = await __1.db
        .select()
        .from(schema_1.gamePlayers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.gamePlayers.playerId, playerId), (0, drizzle_orm_1.eq)(schema_1.gamePlayers.gameId, gameId)));
    if (link)
        return true;
    return false;
};
exports.getPlayerInGame = getPlayerInGame;
const getPlayerGames = async ({ playerId }) => {
    const gamesOfPlayer = await __1.db
        .select()
        .from(schema_1.gamePlayers)
        .where((0, drizzle_orm_1.eq)(schema_1.gamePlayers.playerId, playerId));
    return gamesOfPlayer;
};
exports.getPlayerGames = getPlayerGames;
const removePlayerFromGame = async ({ playerId, gameId, }) => {
    // Remove player from this game in the join table
    await __1.db
        .delete(schema_1.gamePlayers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.gamePlayers.playerId, playerId), (0, drizzle_orm_1.eq)(schema_1.gamePlayers.gameId, gameId)));
    const gameRounds = await (0, game_query_1.getRoundsByGameId)({ gameId });
    if (gameRounds) {
        const roundIds = gameRounds.map((x) => x.id);
        await __1.db
            .delete(schema_1.decisions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.decisions.playerId, playerId), (0, drizzle_orm_1.inArray)(schema_1.decisions.roundId, roundIds)));
    }
};
exports.removePlayerFromGame = removePlayerFromGame;
