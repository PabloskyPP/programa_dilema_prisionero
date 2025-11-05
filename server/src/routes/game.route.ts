import { Router, Request, Response } from "express";
import { db } from "../db";
import { asc, desc, eq, or, sql } from "drizzle-orm";
import { chats, decisions, games, players, rounds } from "../db/schema";
import { generateUniqueGameId } from "../utils/generateGameId";
import { io } from "..";
import { getActiveGameId } from "../utils/getActiveGameId";
import { getActiveRoundId } from "../utils/getAcitveRoundId";
import {
  createNewGame,
  createNewRound,
  getActiveGame,
  getCurrentRound,
  getGameById,
} from "../db/queries/game.query";
import { getChat } from "../db/queries/chat.query";
import {
  getAllDecisionsByGameId,
  getDecisionsByRoundId,
} from "../db/queries/decision.query";
import {
  getPlayerById,
  getPlayerInGame,
  getPlayers,
} from "../db/queries/players.query";

const router = Router(); // ✅ Define router here

// ✅ Route handler: checks for active/waiting game, or creates a new one
router.get("/", async (_req: Request, res: Response): Promise<any> => {
  try {
    const activeGame = await getActiveGame();
    if (activeGame) {
      return res.json(activeGame);
    }

    const id = await generateUniqueGameId();
    const newGame = await createNewGame({ id });

    return res.json(newGame);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/next-round",
  async (req: Request, res: Response): Promise<any> => {
    const { gameId } = await req.body;
    try {
      let lastRound = 0;
      const roundData = await getCurrentRound({ gameId });

      if (roundData) {
        lastRound = roundData.roundNumber;
      }

      // io.to(gameId).emit("new_round", newRound);
      const newRound = await createNewRound({ gameId, lastRound });
      res.status(201).json(newRound);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/:gameId/current-round",
  async (req: Request, res: Response): Promise<any> => {
    const { gameId } = req.params;
    const roundData = await getCurrentRound({ gameId });

    if (!roundData) {
      return res.json(null);
    }

    res.json(roundData);
  }
);
router.get(
  "/vote-completed",
  async (req: Request, res: Response): Promise<any> => {
    const { id: gameId } = await getActiveGameId();
    const { id: roundId } = await getActiveRoundId();
    await handleRoundEnd({ gameId });
  }
);

router.get("/votes", async (req: Request, res: Response): Promise<any> => {
  const activeGame = await getActiveGame();
  if (!activeGame) {
    return res.json([]);
  }
  const gameId = activeGame.id;
  const roundDetails = await getCurrentRound({ gameId });
  if (!roundDetails) {
    return res.json([]);
  }
  const roundId = roundDetails.id;
  const votesData = await getDecisionsByRoundId({ roundId });
  res.json(votesData);
});

router.get(
  "/game-summary",
  async (req: Request, res: Response): Promise<any> => {
    const { id: gameId } = await getActiveGameId();
    const data = await handleRoundEnd({ gameId });
    let players = await getPlayers({ gameId });
    const updatedPlayers = players.map((x) => {
      return {
        id: x.id,
        name: x.name,
      };
    });

    res.json({ data: data, players: updatedPlayers });
  }
);

router.get(
  "/player/:playerId",
  async (req: Request, res: Response): Promise<any> => {
    const { playerId } = req.params;
    if (!playerId) return res.json(false);
    let id: number;
    try {
      id = parseInt(playerId);
      if (isNaN(id)) return res.json(false);
    } catch (e) {
      return res.json(false);
    }
    const player = await getPlayerById({ id });
    if (player) {
      return res.json(true);
    }

    return res.json(false);
  }
);

router.get(
  "/:gameId/game-summary",
  async (req: Request, res: Response): Promise<any> => {
    const { gameId } = req.params;
    const data = await handleRoundEnd({ gameId });
    let players = await getPlayers({ gameId });
    const updatedPlayers = players.map((x) => {
      return {
        id: x.id,
        name: x.name,
      };
    });

    res.json({ data: data, players: updatedPlayers });
  }
);

router.get(
  "/:gameId/game-status",
  async (req: Request, res: Response): Promise<any> => {
    const { gameId } = req.params;
    const currentGame = await getGameById({ gameId });
    if (currentGame) {
      return res.json({ status: currentGame.status });
    }

    return res.json({ status: null });
  }
);

router.get(
  "/:gameId/:playerId",
  async (req: Request, res: Response): Promise<any> => {
    const { playerId, gameId } = req.params;
    if (!playerId || !gameId) return res.json(false);
    let id: number;
    try {
      id = parseInt(playerId);
      if (isNaN(id)) return res.json(false);
    } catch (e) {
      return res.json(false);
    }
    const player = await getPlayerById({ id });
    if (player) {
      const playerIsInGame = await getPlayerInGame({
        gameId,
        playerId: player.id,
      });
      if (playerIsInGame) {
        return res.json(true);
      }
    }

    return res.json(false);
  }
);

export async function handleRoundEnd({ gameId }: { gameId: string }) {
  const allRounds = await db
    .select({ id: rounds.id, roundNumber: rounds.roundNumber })
    .from(rounds)
    .where(eq(rounds.gameId, gameId))
    .orderBy(asc(rounds.roundNumber));

  const allDecisions = await db
    .select({
      roundId: decisions.roundId,
      playerId: decisions.playerId,
      decision: decisions.decision,
      playerName: players.name,
    })
    .from(decisions)
    .innerJoin(players, eq(decisions.playerId, players.id))
    .innerJoin(rounds, eq(decisions.roundId, rounds.id))
    .where(eq(rounds.gameId, gameId));

  const summary: Record<
    string,
    {
      playerIncomes: {
        playerId: number;
        playerName: string;
        decision: string;
        income: number;
        totalBalance: number;
      }[];
    }
  > = {};

  const playerBalances: Record<number, number> = {}; // playerId → total income

  for (const round of allRounds) {
    const roundDecisions = allDecisions.filter((d) => d.roundId === round.id);

    const collaborators = roundDecisions.filter(
      (d) => d.decision === "collaborate"
    );
    const defectors = roundDecisions.filter((d) => d.decision === "defect");

    const totalCollaborators = collaborators.length;
    const totalDefectors = defectors.length;
    const totalPlayers = roundDecisions.length;

    const playerIncomes = roundDecisions
      .map((d) => {
        let income = 0;

        if (d.decision === "collaborate") {
          income = 1 - totalDefectors;
        } else {
          if (totalCollaborators > totalDefectors) {
            income = totalCollaborators / totalDefectors;
          } else if (totalCollaborators === 0) {
            income = totalPlayers * -1;
          } else {
            income = (totalDefectors / totalCollaborators) * -1;
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

export default router; // ✅ Export the Router — not a function!
