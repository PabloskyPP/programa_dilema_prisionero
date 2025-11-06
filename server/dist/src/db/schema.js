"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamePlayers = exports.players = exports.rounds = exports.chats = exports.decisions = exports.games = exports.decision = exports.gameStatus = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.gameStatus = (0, pg_core_1.pgEnum)("game_status", [
    "waiting",
    "instructions",
    "active",
    "completed",
]);
exports.decision = (0, pg_core_1.pgEnum)("decision", ["collaborate", "defect"]);
exports.games = (0, pg_core_1.pgTable)("games", {
    id: (0, pg_core_1.varchar)({ length: 8 }).primaryKey().notNull(),
    numberOfPlayers: (0, pg_core_1.integer)("number_of_players").default(0).notNull(),
    status: (0, exports.gameStatus)().default("waiting").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
        mode: "string",
    })
        .defaultNow()
        .notNull(),
});
exports.decisions = (0, pg_core_1.pgTable)("decisions", {
    id: (0, pg_core_1.serial)().primaryKey(),
    roundId: (0, pg_core_1.integer)("round_id").notNull(),
    playerId: (0, pg_core_1.integer)("player_id").notNull(),
    decision: (0, exports.decision)().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
        mode: "string",
    })
        .defaultNow()
        .notNull(),
}, (table) => [
    (0, pg_core_1.unique)("round_player_unique").on(table.roundId, table.playerId), // ✅ use `unique`, not `uniqueIndex`
    (0, pg_core_1.foreignKey)({
        columns: [table.roundId],
        foreignColumns: [exports.rounds.id],
        name: "decisions_round_id_rounds_id_fk",
    }).onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.playerId],
        foreignColumns: [exports.players.id],
        name: "decisions_player_id_players_id_fk",
    }).onDelete("cascade"),
]);
exports.chats = (0, pg_core_1.pgTable)("chats", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    roundId: (0, pg_core_1.integer)("round_id").notNull(),
    playerId: (0, pg_core_1.integer)("player_id").notNull(),
    messageText: (0, pg_core_1.text)("message_text").notNull(),
    sentAt: (0, pg_core_1.timestamp)("sent_at", {
        withTimezone: true,
        mode: "string",
    })
        .defaultNow()
        .notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.roundId],
        foreignColumns: [exports.rounds.id],
        name: "chats_round_id_rounds_id_fk",
    }).onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.playerId],
        foreignColumns: [exports.players.id],
        name: "chats_player_id_players_id_fk",
    }).onDelete("cascade"),
]);
exports.rounds = (0, pg_core_1.pgTable)("rounds", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    gameId: (0, pg_core_1.varchar)("game_id", { length: 8 }).notNull(),
    roundNumber: (0, pg_core_1.integer)("round_number").notNull(),
    isVotingFinished: (0, pg_core_1.boolean)("is_voting_finished").default(false).notNull(),
    startedAt: (0, pg_core_1.timestamp)("started_at", {
        withTimezone: true,
        mode: "string",
    })
        .defaultNow()
        .notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.gameId],
        foreignColumns: [exports.games.id],
        name: "rounds_game_id_games_id_fk",
    }).onDelete("cascade"),
]);
exports.players = (0, pg_core_1.pgTable)("players", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    socketId: (0, pg_core_1.varchar)("socket_id", { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    income: (0, pg_core_1.real)("income").default(0).notNull(),
    joinedAt: (0, pg_core_1.timestamp)("joined_at", {
        withTimezone: true,
        mode: "string",
    })
        .defaultNow()
        .notNull(),
});
exports.gamePlayers = (0, pg_core_1.pgTable)("game_players", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    gameId: (0, pg_core_1.varchar)("game_id", { length: 8 }).notNull(),
    playerId: (0, pg_core_1.integer)("player_id").notNull(),
    joinedAt: (0, pg_core_1.timestamp)("joined_at", {
        withTimezone: true,
        mode: "string",
    })
        .defaultNow()
        .notNull(),
}, (table) => [
    (0, pg_core_1.unique)().on(table.gameId, table.playerId),
    (0, pg_core_1.foreignKey)({
        columns: [table.gameId],
        foreignColumns: [exports.games.id],
        name: "game_players_game_id_games_id_fk",
    }).onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.playerId],
        foreignColumns: [exports.players.id],
        name: "game_players_player_id_players_id_fk",
    }).onDelete("cascade"),
]);
