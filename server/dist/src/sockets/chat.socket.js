"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const players_query_1 = require("../db/queries/players.query");
const chat_query_1 = require("../db/queries/chat.query");
exports.default = (io, socket) => {
    socket.on("send_round_chat_message", async ({ roundId, messageText }) => {
        // Get player info from socket/session (you need to implement this)
        const player = await (0, players_query_1.getPlayerBySocketId)({ socketId: socket.id });
        if (!player) {
            return;
        }
        await (0, chat_query_1.insertMessage)({
            roundId,
            playerId: player.id,
            messageText,
        });
        // Broadcast message to everyone in the round room
        io.to(`round_${roundId}`).emit("round_chat_message", {
            playerName: player.name,
            message: messageText,
        });
    });
    socket.on("join_round_chat", ({ roundId }) => {
        socket.join(`round_chat_${roundId}`);
    });
    socket.on("send_chat_message", async ({ roundId, playerId, message, }) => {
        // Save to DB
        await (0, chat_query_1.insertMessage)({
            roundId,
            playerId,
            messageText: message,
        });
        // Get player name (optional)
        const { name } = await (0, players_query_1.getPlayerById)({ id: playerId });
        // Broadcast to others
        io.to(`round_chat_${roundId}`).emit("receive_chat_message", {
            playerName: name ?? "Unknown",
            message,
            sentAt: new Date().toISOString(),
        });
    });
};
