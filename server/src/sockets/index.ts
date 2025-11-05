import { Server, Socket } from "socket.io";
import registerGameHandlers from "./game.socket";
import registerChatHandlers from "./chat.socket";
import registerAdminHandlers from "./admin.socket";
import registerPlayerHandlers from "./player.socket";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Delegate to modular handlers
    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerAdminHandlers(io, socket);
    registerPlayerHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}
