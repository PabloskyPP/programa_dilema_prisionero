"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueGameId = generateUniqueGameId;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateRandomId(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Generates a unique game ID of length 6-8
 * by checking the database for collisions.
 */
async function generateUniqueGameId() {
    while (true) {
        const length = Math.floor(Math.random() * 3) + 6; // 6-8 chars
        const id = generateRandomId(length);
        // Check if id exists in DB
        const existing = await db_1.db.select().from(schema_1.games).where((0, drizzle_orm_1.eq)(schema_1.games.id, id));
        if (existing.length === 0) {
            // Unique ID found
            return id;
        }
        // else loop again to generate a new ID
    }
}
