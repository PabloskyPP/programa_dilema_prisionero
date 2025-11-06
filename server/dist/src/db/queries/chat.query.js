"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChat = exports.insertMessage = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const __1 = require("..");
const schema_1 = require("../schema");
const insertMessage = async ({ roundId, playerId, messageText, }) => {
    await __1.db.insert(schema_1.chats).values({
        roundId,
        playerId,
        messageText,
    });
};
exports.insertMessage = insertMessage;
const getChat = async ({ roundId }) => {
    const messages = await __1.db
        .select({
        message: schema_1.chats.messageText,
        sentAt: schema_1.chats.sentAt,
        playerName: schema_1.players.name,
    })
        .from(schema_1.chats)
        .innerJoin(schema_1.players, (0, drizzle_orm_1.eq)(schema_1.chats.playerId, schema_1.players.id))
        .where((0, drizzle_orm_1.eq)(schema_1.chats.roundId, roundId));
    return messages;
};
exports.getChat = getChat;
