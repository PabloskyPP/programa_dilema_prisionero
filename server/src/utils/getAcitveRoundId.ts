import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { games, rounds } from "../db/schema";
import { getActiveGameId } from "./getActiveGameId";

export const getActiveRoundId = async () => {
  const activeGame = await getActiveGameId();
  const gameId = activeGame.id;
  const [data] = await db.select().from(rounds).orderBy(desc(rounds.id));
  return data;
};
