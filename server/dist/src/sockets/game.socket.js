"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const players_query_1 = require("../db/queries/players.query");
const decision_query_1 = require("../db/queries/decision.query");
const game_query_1 = require("../db/queries/game.query");
exports.default = (io, socket) => {
    socket.on("start_round", (round) => {
        io.to(round.gameId).emit("new_round", round);
    });
    socket.on("join_round_chat", ({ roundId }) => {
        socket.join(`round_${roundId}`);
    });
    socket.on("leave_round_chat", ({ roundId }) => {
        socket.leave(`round_${roundId}`);
    });
    socket.on("submit_decision", async ({ decision, roundId, gameId, playerId }) => {
        try {
            const player = await (0, players_query_1.getPlayerById)({ id: playerId });
            if (!player) {
                console.log("player not found");
                return;
            }
            const existingVote = await (0, decision_query_1.getDecision)({
                playerId,
                roundId,
            });
            if (existingVote) {
                socket.emit("vote_error", { message: "You have already voted." });
                return;
            }
            // Save message to DB
            await (0, decision_query_1.insertDecision)({
                playerId,
                roundId,
                decision,
            });
            const playerCount = await (0, players_query_1.getPlayers)({ gameId });
            const voteCount = await (0, decision_query_1.getDecisionsByRoundId)({ roundId });
            io.to(gameId).emit("vote_update", {
                totalVotes: voteCount.length,
                totalPlayers: playerCount,
                playerId,
            });
            socket.emit("player_vote_completed");
            if (voteCount.length === playerCount.length) {
                const roundData = await (0, game_query_1.updateRoundVoting)({
                    roundId,
                    isVotingFinished: true,
                });
                io.to(gameId).emit("voting_complete", { roundData });
            }
        }
        catch (e) {
            console.log("Error:", e);
            socket.emit("vote_error", { message: "Vote failed. Try again." });
        }
    });
};
