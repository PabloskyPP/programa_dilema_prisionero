import { and, eq } from "drizzle-orm";
import { db } from "..";
import { Decision, decisions, rounds } from "../schema";

export const getDecision = async ({
  playerId,
  roundId,
}: {
  playerId: number;
  roundId: number;
}) => {
  const [existingVote] = await db
    .select()
    .from(decisions)
    .where(
      and(eq(decisions.roundId, roundId), eq(decisions.playerId, playerId))
    );
  return existingVote;
};

export const insertDecision = async ({
  playerId,
  roundId,
  decision,
}: {
  playerId: number;
  roundId: number;
  decision: Decision;
}) => {
  await db.insert(decisions).values({
    playerId: playerId,
    decision,
    roundId,
  });
};

export const getDecisionsByRoundId = async ({
  roundId,
}: {
  roundId: number;
}) => {
  const data = await db
    .select()
    .from(decisions)
    .where(eq(decisions.roundId, roundId));
  return data;
};

export const getAllDecisionsByGameId = async ({
  gameId,
}: {
  gameId: string;
}) => {
  const data = await db
    .select({
      playerId: decisions.playerId,
      roundId: decisions.roundId,
      decision: decisions.decision,
    })
    .from(decisions)
    .innerJoin(rounds, eq(decisions.roundId, rounds.id))
    .where(eq(rounds.gameId, gameId));

  return data;
};
