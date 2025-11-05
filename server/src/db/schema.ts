import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  foreignKey,
  serial,
  integer,
  varchar,
  timestamp,
  text,
  pgEnum,
  unique,
  real,
  boolean,
} from "drizzle-orm/pg-core";

export const gameStatus = pgEnum("game_status", [
  "waiting",
  "instructions",
  "active",
  "completed",
]);

export const decision = pgEnum("decision", ["collaborate", "defect"]);
export const games = pgTable("games", {
  id: varchar({ length: 8 }).primaryKey().notNull(),
  numberOfPlayers: integer("number_of_players").default(0).notNull(),
  status: gameStatus().default("waiting").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
});

export const decisions = pgTable(
  "decisions",
  {
    id: serial().primaryKey(),
    roundId: integer("round_id").notNull(),
    playerId: integer("player_id").notNull(),
    decision: decision().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("round_player_unique").on(table.roundId, table.playerId), // ✅ use `unique`, not `uniqueIndex`

    foreignKey({
      columns: [table.roundId],
      foreignColumns: [rounds.id],
      name: "decisions_round_id_rounds_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.playerId],
      foreignColumns: [players.id],
      name: "decisions_player_id_players_id_fk",
    }).onDelete("cascade"),
  ]
);

export const chats = pgTable(
  "chats",
  {
    id: serial().primaryKey().notNull(),
    roundId: integer("round_id").notNull(),
    playerId: integer("player_id").notNull(),
    messageText: text("message_text").notNull(),
    sentAt: timestamp("sent_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.roundId],
      foreignColumns: [rounds.id],
      name: "chats_round_id_rounds_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.playerId],
      foreignColumns: [players.id],
      name: "chats_player_id_players_id_fk",
    }).onDelete("cascade"),
  ]
);

export const rounds = pgTable(
  "rounds",
  {
    id: serial().primaryKey().notNull(),
    gameId: varchar("game_id", { length: 8 }).notNull(),
    roundNumber: integer("round_number").notNull(),
    isVotingFinished: boolean("is_voting_finished").default(false).notNull(),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.gameId],
      foreignColumns: [games.id],
      name: "rounds_game_id_games_id_fk",
    }).onDelete("cascade"),
  ]
);

export const players = pgTable("players", {
  id: serial().primaryKey().notNull(),
  socketId: varchar("socket_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  income: real("income").default(0).notNull(),
  joinedAt: timestamp("joined_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
});

export const gamePlayers = pgTable(
  "game_players",
  {
    id: serial().primaryKey().notNull(),
    gameId: varchar("game_id", { length: 8 }).notNull(),
    playerId: integer("player_id").notNull(),
    joinedAt: timestamp("joined_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique().on(table.gameId, table.playerId),
    foreignKey({
      columns: [table.gameId],
      foreignColumns: [games.id],
      name: "game_players_game_id_games_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.playerId],
      foreignColumns: [players.id],
      name: "game_players_player_id_players_id_fk",
    }).onDelete("cascade"),
  ]
);

export type SelectPlayer = InferSelectModel<typeof players>;
export type InsertPlayer = InferInsertModel<typeof players>;

export type Decision = (typeof decision)["enumValues"][number];
export type GameStatus = (typeof gameStatus)["enumValues"][number];
