import { eq } from "drizzle-orm";
import { db } from "../db";
import { games } from "../db/schema";

export const getActiveGameId = async () => {
  const [data] = await db
    .select()
    .from(games)
    .where(eq(games.status, "active"));
  return data;
};
