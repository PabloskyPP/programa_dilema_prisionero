"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = require("http");
const server_1 = __importDefault(require("./server"));
const socket_io_1 = require("socket.io");
const sockets_1 = require("./sockets");
const PORT = 3001;
const httpServer = (0, http_1.createServer)(server_1.default);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
(0, sockets_1.registerSocketHandlers)(exports.io);
httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
