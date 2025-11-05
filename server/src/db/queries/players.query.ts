import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "..";
import { decisions, gamePlayers, InsertPlayer, players } from "../schema";
import { getRoundsByGameId } from "./game.query";

export const getPlayers = async ({ gameId }: { gameId: string }) => {
  const playersData = await db
    .select()
    .from(gamePlayers)
    .where(eq(gamePlayers.gameId, gameId))
    .innerJoin(players, eq(gamePlayers.playerId, players.id))
    .orderBy(asc(players.id));

  // Optional: Return just the player data, not join metadata
  return playersData.map((row) => row.players);
};

export const getPlayerById = async ({ id }: { id: number }) => {
  const [playerData] = await db
    .select()
    .from(players)
    .where(eq(players.id, id))
    .limit(1);
  return playerData;
};

export const insertPlayer = async ({
  gameId,
  playerName,
  socketId,
}: {
  gameId: string;
  playerName: string;
  socketId: string;
}) => {
  const [player] = await db
    .insert(players)
    .values({
      name: playerName,
      socketId,
    })
    .returning();

  // Step 2: Link player to game
  await db.insert(gamePlayers).values({
    gameId,
    playerId: player.id,
  });

  return player;
};

export const addPlayerToGame = async ({
  gameId,
  playerId,
  socketId,
}: {
  gameId: string;
  playerId: number;
  socketId: string;
}) => {
  const [player] = await db
    .insert(gamePlayers)
    .values({
      gameId,
      playerId,
    })
    .returning();
  await reconnectPlayer({ playerId, socketId });
  return player;
};

export const reconnectPlayer = async ({
  playerId,
  socketId,
}: {
  playerId: number;
  socketId: string;
}) => {
  const [data] = await db
    .update(players)
    .set({
      socketId,
    })
    .where(eq(players.id, playerId))
    .returning();

  return data;
};

export const getPlayerBySocketId = async ({
  socketId,
}: {
  socketId: string;
}) => {
  const [playerData] = await db
    .select()
    .from(players)
    .where(eq(players.socketId, socketId))
    .limit(1);
  return playerData;
};

export const deletePlayerBySocketId = async ({
  socketId,
}: {
  socketId: string;
}) => {
  await db.delete(players).where(eq(players.socketId, socketId));
};

export const getPlayerInGame = async ({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: number;
}) => {
  const [link] = await db
    .select()
    .from(gamePlayers)
    .where(
      and(eq(gamePlayers.playerId, playerId), eq(gamePlayers.gameId, gameId))
    );
  if (link) return true;
  return false;
};

export const getPlayerGames = async ({ playerId }: { playerId: number }) => {
  const gamesOfPlayer = await db
    .select()
    .from(gamePlayers)
    .where(eq(gamePlayers.playerId, playerId));
  return gamesOfPlayer;
};

export const removePlayerFromGame = async ({
  playerId,
  gameId,
}: {
  playerId: number;
  gameId: string;
}) => {
  // Remove player from this game in the join table
  await db
    .delete(gamePlayers)
    .where(
      and(eq(gamePlayers.playerId, playerId), eq(gamePlayers.gameId, gameId))
    );

  const gameRounds = await getRoundsByGameId({ gameId });
  if (gameRounds) {
    const roundIds = gameRounds.map((x) => x.id);
    await db
      .delete(decisions)
      .where(
        and(
          eq(decisions.playerId, playerId),
          inArray(decisions.roundId, roundIds)
        )
      );
  }
};
