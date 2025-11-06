"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveGameId = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const getActiveGameId = async () => {
    const [data] = await db_1.db
        .select()
        .from(schema_1.games)
        .where((0, drizzle_orm_1.eq)(schema_1.games.status, "active"));
    return data;
};
exports.getActiveGameId = getActiveGameId;
