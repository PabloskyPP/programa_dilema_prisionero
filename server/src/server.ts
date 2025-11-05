import express from "express";
import gameRoutes from "./routes/game.route";
import chatRoutes from "./routes/chat.route";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/api/game", gameRoutes); // ✅ No function call here
app.use("/api/chat", chatRoutes); // ✅ No function call here

export default app;
