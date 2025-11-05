import { desc, eq, ne } from "drizzle-orm";
import { gamePlayers, games, GameStatus, rounds } from "../schema";
import { db } from "..";

export const getGameById = async ({ gameId }: { gameId: string }) => {
  const [gameData] = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);
  return gameData;
};

export const getActiveGame = async () => {
  const [activeGame] = await db
    .select()
    .from(games)
    .where(ne(games.status, "completed"))
    .limit(1);

  return activeGame;
};

export const createNewGame = async ({ id }: { id: string }) => {
  const [newGame] = await db
    .insert(games)
    .values({
      id,
    })
    .returning();
  return newGame;
};

export const updateGameStatus = async ({
  gameId,
  status,
}: {
  gameId: string;
  status: GameStatus;
}) => {
  const [data] = await db
    .update(games)
    .set({ status })
    .where(eq(games.id, gameId))
    .returning();
  return data;
};

export const getCurrentRound = async ({ gameId }: { gameId: string }) => {
  const [roundData] = await db
    .select()
    .from(rounds)
    .where(eq(rounds.gameId, gameId))
    .orderBy(desc(rounds.roundNumber))
    .limit(1);
  return roundData;
};

export const endGame = async ({ gameId }: { gameId: string }) => {
  const [roundData] = await db
    .update(games)
    .set({ status: "completed" })
    .where(eq(games.id, gameId))
    .returning();
  return roundData;
};
export const createNewRound = async ({
  gameId,
  lastRound,
}: {
  gameId: string;
  lastRound: number;
}) => {
  const [newRound] = await db
    .insert(rounds)
    .values({
      gameId,
      roundNumber: lastRound + 1,
    })
    .returning();
  return newRound;
};

export const updateRoundVoting = async ({
  roundId,
  isVotingFinished,
}: {
  roundId: number;
  isVotingFinished: boolean;
}) => {
  const [data] = await db
    .update(rounds)
    .set({ isVotingFinished })
    .where(eq(rounds.id, roundId))
    .returning();
  return data;
};

export const getPlayersInGame = async ({ gameId }: { gameId: string }) => {
  const data = await db
    .select()
    .from(gamePlayers)
    .where(eq(gamePlayers.gameId, gameId));
  return data;
};

export const deleteGameById = async ({ gameId }: { gameId: string }) => {
  try {
    await db.delete(games).where(eq(games.id, gameId));
    return true;
  } catch (e) {
    console.log("Error deleting game: ", e);
    return false;
  }
};

export const getRoundsByGameId = async ({ gameId }: { gameId: string }) => {
  const data = await db.select().from(rounds).where(eq(rounds.gameId, gameId));
  return data;
};
