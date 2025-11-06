"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDecisionsByGameId = exports.getDecisionsByRoundId = exports.insertDecision = exports.getDecision = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const __1 = require("..");
const schema_1 = require("../schema");
const getDecision = async ({ playerId, roundId, }) => {
    const [existingVote] = await __1.db
        .select()
        .from(schema_1.decisions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.decisions.roundId, roundId), (0, drizzle_orm_1.eq)(schema_1.decisions.playerId, playerId)));
    return existingVote;
};
exports.getDecision = getDecision;
const insertDecision = async ({ playerId, roundId, decision, }) => {
    await __1.db.insert(schema_1.decisions).values({
        playerId: playerId,
        decision,
        roundId,
    });
};
exports.insertDecision = insertDecision;
const getDecisionsByRoundId = async ({ roundId, }) => {
    const data = await __1.db
        .select()
        .from(schema_1.decisions)
        .where((0, drizzle_orm_1.eq)(schema_1.decisions.roundId, roundId));
    return data;
};
exports.getDecisionsByRoundId = getDecisionsByRoundId;
const getAllDecisionsByGameId = async ({ gameId, }) => {
    const data = await __1.db
        .select({
        playerId: schema_1.decisions.playerId,
        roundId: schema_1.decisions.roundId,
        decision: schema_1.decisions.decision,
    })
        .from(schema_1.decisions)
        .innerJoin(schema_1.rounds, (0, drizzle_orm_1.eq)(schema_1.decisions.roundId, schema_1.rounds.id))
        .where((0, drizzle_orm_1.eq)(schema_1.rounds.gameId, gameId));
    return data;
};
exports.getAllDecisionsByGameId = getAllDecisionsByGameId;
