"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveRoundId = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const getActiveGameId_1 = require("./getActiveGameId");
const getActiveRoundId = async () => {
    const activeGame = await (0, getActiveGameId_1.getActiveGameId)();
    const gameId = activeGame.id;
    const [data] = await db_1.db.select().from(schema_1.rounds).orderBy((0, drizzle_orm_1.desc)(schema_1.rounds.id));
    return data;
};
exports.getActiveRoundId = getActiveRoundId;
