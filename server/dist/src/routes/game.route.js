"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRoundEnd = handleRoundEnd;
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const generateGameId_1 = require("../utils/generateGameId");
const getActiveGameId_1 = require("../utils/getActiveGameId");
const getAcitveRoundId_1 = require("../utils/getAcitveRoundId");
const game_query_1 = require("../db/queries/game.query");
const decision_query_1 = require("../db/queries/decision.query");
const players_query_1 = require("../db/queries/players.query");
const router = (0, express_1.Router)(); // ✅ Define router here
// ✅ Route handler: checks for active/waiting game, or creates a new one
router.get("/", async (_req, res) => {
    try {
        const activeGame = await (0, game_query_1.getActiveGame)();
        if (activeGame) {
            return res.json(activeGame);
        }
        const id = await (0, generateGameId_1.generateUniqueGameId)();
        const newGame = await (0, game_query_1.createNewGame)({ id });
        return res.json(newGame);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/next-round", async (req, res) => {
    const { gameId } = await req.body;
    try {
        let lastRound = 0;
        const roundData = await (0, game_query_1.getCurrentRound)({ gameId });
        if (roundData) {
            lastRound = roundData.roundNumber;
        }
        // io.to(gameId).emit("new_round", newRound);
        const newRound = await (0, game_query_1.createNewRound)({ gameId, lastRound });
        res.status(201).json(newRound);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/:gameId/current-round", async (req, res) => {
    const { gameId } = req.params;
    const roundData = await (0, game_query_1.getCurrentRound)({ gameId });
    if (!roundData) {
        return res.json(null);
    }
    res.json(roundData);
});
router.get("/vote-completed", async (req, res) => {
    const { id: gameId } = await (0, getActiveGameId_1.getActiveGameId)();
    const { id: roundId } = await (0, getAcitveRoundId_1.getActiveRoundId)();
    await handleRoundEnd({ gameId });
});
router.get("/votes", async (req, res) => {
    const activeGame = await (0, game_query_1.getActiveGame)();
    if (!activeGame) {
        return res.json([]);
    }
    const gameId = activeGame.id;
    const roundDetails = await (0, game_query_1.getCurrentRound)({ gameId });
    if (!roundDetails) {
        return res.json([]);
    }
    const roundId = roundDetails.id;
    const votesData = await (0, decision_query_1.getDecisionsByRoundId)({ roundId });
    res.json(votesData);
});
router.get("/game-summary", async (req, res) => {
    const { id: gameId } = await (0, getActiveGameId_1.getActiveGameId)();
    const data = await handleRoundEnd({ gameId });
    let players = await (0, players_query_1.getPlayers)({ gameId });
    const updatedPlayers = players.map((x) => {
        return {
            id: x.id,
            name: x.name,
        };
    });
    res.json({ data: data, players: updatedPlayers });
});
router.get("/player/:playerId", async (req, res) => {
    const { playerId } = req.params;
    if (!playerId)
        return res.json(false);
    let id;
    try {
        id = parseInt(playerId);
        if (isNaN(id))
            return res.json(false);
    }
    catch (e) {
        return res.json(false);
    }
    const player = await (0, players_query_1.getPlayerById)({ id });
    if (player) {
        return res.json(true);
    }
    return res.json(false);
});
router.get("/:gameId/game-summary", async (req, res) => {
    const { gameId } = req.params;
    const data = await handleRoundEnd({ gameId });
    let players = await (0, players_query_1.getPlayers)({ gameId });
    const updatedPlayers = players.map((x) => {
        return {
            id: x.id,
            name: x.name,
        };
    });
    res.json({ data: data, players: updatedPlayers });
});
router.get("/:gameId/game-status", async (req, res) => {
    const { gameId } = req.params;
    const currentGame = await (0, game_query_1.getGameById)({ gameId });
    if (currentGame) {
        return res.json({ status: currentGame.status });
    }
    return res.json({ status: null });
});
router.get("/:gameId/:playerId", async (req, res) => {
    const { playerId, gameId } = req.params;
    if (!playerId || !gameId)
        return res.json(false);
    let id;
    try {
        id = parseInt(playerId);
        if (isNaN(id))
            return res.json(false);
    }
    catch (e) {
        return res.json(false);
    }
    const player = await (0, players_query_1.getPlayerById)({ id });
    if (player) {
        const playerIsInGame = await (0, players_query_1.getPlayerInGame)({
            gameId,
            playerId: player.id,
        });
        if (playerIsInGame) {
            return res.json(true);
        }
    }
    return res.json(false);
});
async function handleRoundEnd({ gameId }) {
    const allRounds = await db_1.db
        .select({ id: schema_1.rounds.id, roundNumber: schema_1.rounds.roundNumber })
        .from(schema_1.rounds)
        .where((0, drizzle_orm_1.eq)(schema_1.rounds.gameId, gameId))
        .orderBy((0, drizzle_orm_1.asc)(schema_1.rounds.roundNumber));
    const allDecisions = await db_1.db
        .select({
        roundId: schema_1.decisions.roundId,
        playerId: schema_1.decisions.playerId,
        decision: schema_1.decisions.decision,
        playerName: schema_1.players.name,
    })
        .from(schema_1.decisions)
        .innerJoin(schema_1.players, (0, drizzle_orm_1.eq)(schema_1.decisions.playerId, schema_1.players.id))
        .innerJoin(schema_1.rounds, (0, drizzle_orm_1.eq)(schema_1.decisions.roundId, schema_1.rounds.id))
        .where((0, drizzle_orm_1.eq)(schema_1.rounds.gameId, gameId));
    const summary = {};
    const playerBalances = {}; // playerId → total income
    for (const round of allRounds) {
        const roundDecisions = allDecisions.filter((d) => d.roundId === round.id);
        const collaborators = roundDecisions.filter((d) => d.decision === "collaborate");
        const defectors = roundDecisions.filter((d) => d.decision === "defect");
        const totalCollaborators = collaborators.length;
        const totalDefectors = defectors.length;
        const totalPlayers = roundDecisions.length;
        const playerIncomes = roundDecisions
            .map((d) => {
            let income = 0;
            // New scoring logic
            if (totalDefectors === 0) {
                // Everyone collaborates → everyone gets +1
                income = 1;
            }
            else if (totalCollaborators > totalDefectors) {
                // Majority collaborators
                if (d.decision === "collaborate") {
                    income = totalCollaborators / totalPlayers;
                }
                else {
                    // Defectors get +1, but if only one defector, gets +2
                    income = totalDefectors === 1 ? 2 : 1;
                }
            }
            else if (totalCollaborators === totalDefectors) {
                // Equal split → everyone gets 0
                income = 0;
            }
            else if (totalCollaborators < totalDefectors) {
                // Majority defectors
                if (totalCollaborators === 0) {
                    // Everyone defects → everyone loses total players
                    income = -totalPlayers;
                }
                else {
                    // Everyone loses (defectors / total)
                    income = -(totalDefectors / totalPlayers);
                }
            }
            // Update cumulative balance
            playerBalances[d.playerId] = (playerBalances[d.playerId] || 0) + income;
            return {
                playerId: d.playerId,
                playerName: d.playerName,
                decision: d.decision,
                income,
                totalBalance: playerBalances[d.playerId],
            };
        })
            .sort((a, b) => a.playerId - b.playerId);
        summary[`round${round.roundNumber}`] = {
            playerIncomes,
        };
    }
    return summary;
}
exports.default = router; // ✅ Export the Router — not a function!
