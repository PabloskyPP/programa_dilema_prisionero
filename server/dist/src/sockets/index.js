"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const game_socket_1 = __importDefault(require("./game.socket"));
const chat_socket_1 = __importDefault(require("./chat.socket"));
const admin_socket_1 = __importDefault(require("./admin.socket"));
const player_socket_1 = __importDefault(require("./player.socket"));
function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Delegate to modular handlers
        (0, game_socket_1.default)(io, socket);
        (0, chat_socket_1.default)(io, socket);
        (0, admin_socket_1.default)(io, socket);
        (0, player_socket_1.default)(io, socket);
        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
}
