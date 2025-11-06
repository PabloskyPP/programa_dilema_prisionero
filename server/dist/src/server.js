"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const game_route_1 = __importDefault(require("./routes/game.route"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use("/api/game", game_route_1.default); // ✅ No function call here
app.use("/api/chat", chat_route_1.default); // ✅ No function call here
exports.default = app;
