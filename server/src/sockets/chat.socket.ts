import { Server, Socket } from "socket.io";
import {
  getPlayerById,
  getPlayerBySocketId,
} from "../db/queries/players.query";
import { insertMessage } from "../db/queries/chat.query";

export default (io: Server, socket: Socket) => {
  socket.on("send_round_chat_message", async ({ roundId, messageText }) => {
    // Get player info from socket/session (you need to implement this)

    const player = await getPlayerBySocketId({ socketId: socket.id });
    if (!player) {
      return;
    }
    await insertMessage({
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
  socket.on(
    "send_chat_message",
    async ({
      roundId,
      playerId,
      message,
    }: {
      roundId: number;
      playerId: number;
      message: string;
    }) => {
      // Save to DB
      await insertMessage({
        roundId,
        playerId,
        messageText: message,
      });

      // Get player name (optional)
      const { name } = await getPlayerById({ id: playerId });

      // Broadcast to others
      io.to(`round_chat_${roundId}`).emit("receive_chat_message", {
        playerName: name ?? "Unknown",
        message,
        sentAt: new Date().toISOString(),
      });
    }
  );
};
