import { eq } from "drizzle-orm";
import { db } from "..";
import { chats, players } from "../schema";

export const insertMessage = async ({
  roundId,
  playerId,
  messageText,
}: {
  roundId: number;
  playerId: number;
  messageText: string;
}) => {
  await db.insert(chats).values({
    roundId,
    playerId,
    messageText,
  });
};

export const getChat = async ({ roundId }: { roundId: number }) => {
  const messages = await db
    .select({
      message: chats.messageText,
      sentAt: chats.sentAt,
      playerName: players.name,
    })
    .from(chats)
    .innerJoin(players, eq(chats.playerId, players.id))
    .where(eq(chats.roundId, roundId));
  return messages;
};
