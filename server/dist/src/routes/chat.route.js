"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_query_1 = require("../db/queries/chat.query");
const router = (0, express_1.Router)(); // ✅ Define router here
router.get("/:roundId/history", async (req, res) => {
    const { roundId } = req.params;
    const round = parseInt(roundId);
    try {
        const chat = await (0, chat_query_1.getChat)({ roundId: round });
        if (chat.length > 0) {
            return res.json(chat);
        }
        return res.json([]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router; // ✅ Export the Router — not a function!
