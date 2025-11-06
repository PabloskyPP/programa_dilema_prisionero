"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoundsByGameId = exports.deleteGameById = exports.getPlayersInGame = exports.updateRoundVoting = exports.createNewRound = exports.endGame = exports.getCurrentRound = exports.updateGameStatus = exports.createNewGame = exports.getActiveGame = exports.getGameById = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../schema");
const __1 = require("..");
const getGameById = async ({ gameId }) => {
    const [gameData] = await __1.db
        .select()
        .from(schema_1.games)
        .where((0, drizzle_orm_1.eq)(schema_1.games.id, gameId))
        .limit(1);
    return gameData;
};
exports.getGameById = getGameById;
const getActiveGame = async () => {
    const [activeGame] = await __1.db
        .select()
        .from(schema_1.games)
        .where((0, drizzle_orm_1.ne)(schema_1.games.status, "completed"))
        .limit(1);
    return activeGame;
};
exports.getActiveGame = getActiveGame;
const createNewGame = async ({ id }) => {
    const [newGame] = await __1.db
        .insert(schema_1.games)
        .values({
        id,
    })
        .returning();
    return newGame;
};
exports.createNewGame = createNewGame;
const updateGameStatus = async ({ gameId, status, }) => {
    const [data] = await __1.db
        .update(schema_1.games)
        .set({ status })
        .where((0, drizzle_orm_1.eq)(schema_1.games.id, gameId))
        .returning();
    return data;
};
exports.updateGameStatus = updateGameStatus;
const getCurrentRound = async ({ gameId }) => {
    const [roundData] = await __1.db
        .select()
        .from(schema_1.rounds)
        .where((0, drizzle_orm_1.eq)(schema_1.rounds.gameId, gameId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.rounds.roundNumber))
        .limit(1);
    return roundData;
};
exports.getCurrentRound = getCurrentRound;
const endGame = async ({ gameId }) => {
    const [roundData] = await __1.db
        .update(schema_1.games)
        .set({ status: "completed" })
        .where((0, drizzle_orm_1.eq)(schema_1.games.id, gameId))
        .returning();
    return roundData;
};
exports.endGame = endGame;
const createNewRound = async ({ gameId, lastRound, }) => {
    const [newRound] = await __1.db
        .insert(schema_1.rounds)
        .values({
        gameId,
        roundNumber: lastRound + 1,
    })
        .returning();
    return newRound;
};
exports.createNewRound = createNewRound;
const updateRoundVoting = async ({ roundId, isVotingFinished, }) => {
    const [data] = await __1.db
        .update(schema_1.rounds)
        .set({ isVotingFinished })
        .where((0, drizzle_orm_1.eq)(schema_1.rounds.id, roundId))
        .returning();
    return data;
};
exports.updateRoundVoting = updateRoundVoting;
const getPlayersInGame = async ({ gameId }) => {
    const data = await __1.db
        .select()
        .from(schema_1.gamePlayers)
        .where((0, drizzle_orm_1.eq)(schema_1.gamePlayers.gameId, gameId));
    return data;
};
exports.getPlayersInGame = getPlayersInGame;
const deleteGameById = async ({ gameId }) => {
    try {
        await __1.db.delete(schema_1.games).where((0, drizzle_orm_1.eq)(schema_1.games.id, gameId));
        return true;
    }
    catch (e) {
        console.log("Error deleting game: ", e);
        return false;
    }
};
exports.deleteGameById = deleteGameById;
const getRoundsByGameId = async ({ gameId }) => {
    const data = await __1.db.select().from(schema_1.rounds).where((0, drizzle_orm_1.eq)(schema_1.rounds.gameId, gameId));
    return data;
};
exports.getRoundsByGameId = getRoundsByGameId;
