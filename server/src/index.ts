import { createServer } from "http";
import app from "./server";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./sockets";

const PORT = 3001;
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
