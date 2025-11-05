import { Server, Socket } from "socket.io";
import { getPlayerById, getPlayers } from "../db/queries/players.query";
import {
  getDecision,
  getDecisionsByRoundId,
  insertDecision,
} from "../db/queries/decision.query";
import { updateRoundVoting } from "../db/queries/game.query";

export default (io: Server, socket: Socket) => {
  socket.on("start_round", (round) => {
    io.to(round.gameId).emit("new_round", round);
  });

  socket.on("join_round_chat", ({ roundId }) => {
    socket.join(`round_${roundId}`);
  });

  socket.on("leave_round_chat", ({ roundId }) => {
    socket.leave(`round_${roundId}`);
  });

  socket.on(
    "submit_decision",
    async ({ decision, roundId, gameId, playerId }) => {
      try {
        const player = await getPlayerById({ id: playerId });

        if (!player) {
          console.log("player not found");
          return;
        }
        const existingVote = await getDecision({
          playerId,
          roundId,
        });

        if (existingVote) {
          socket.emit("vote_error", { message: "You have already voted." });
          return;
        }
        // Save message to DB
        await insertDecision({
          playerId,
          roundId,
          decision,
        });
        const playerCount = await getPlayers({ gameId });
        const voteCount = await getDecisionsByRoundId({ roundId });
        io.to(gameId).emit("vote_update", {
          totalVotes: voteCount.length,
          totalPlayers: playerCount,
          playerId,
        });
        socket.emit("player_vote_completed");
        if (voteCount.length === playerCount.length) {
          const roundData = await updateRoundVoting({
            roundId,
            isVotingFinished: true,
          });
          io.to(gameId).emit("voting_complete", { roundData });
        }
      } catch (e) {
        console.log("Error:", e);
        socket.emit("vote_error", { message: "Vote failed. Try again." });
      }
    }
  );
};
