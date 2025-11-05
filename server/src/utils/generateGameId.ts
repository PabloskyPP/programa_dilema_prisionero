import { eq } from "drizzle-orm";
import { db } from "../db";
import { games } from "../db/schema";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateRandomId(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a unique game ID of length 6-8
 * by checking the database for collisions.
 */
export async function generateUniqueGameId(): Promise<string> {
  while (true) {
    const length = Math.floor(Math.random() * 3) + 6; // 6-8 chars
    const id = generateRandomId(length);

    // Check if id exists in DB
    const existing = await db.select().from(games).where(eq(games.id, id));

    if (existing.length === 0) {
      // Unique ID found
      return id;
    }

    // else loop again to generate a new ID
  }
}
