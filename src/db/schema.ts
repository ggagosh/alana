import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const signals = sqliteTable("signals", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dateAdded: integer("date_added").notNull(),
    lastPriceUpdate: integer("last_price_update"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    coinPair: text("coin_pair").notNull(),
    entryLow: real("entry_low").notNull(),
    entryHigh: real("entry_high").notNull(),
    currentPrice: real("current_price").notNull(),
    stopLoss: real("stop_loss").notNull(),
    dateShared: integer("date_shared").notNull(), // Unix timestamp
}, (table) => ([]));

export const takeProfits = sqliteTable("take_profits", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    signalId: integer("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),
    level: integer("level").notNull(), // 1-8
    price: real("price").notNull(),
    hit: integer("hit", { mode: "boolean" }).notNull().default(false),
    hitDate: integer("hit_date"), // Unix timestamp
}, (table) => ([]));

export const apiKeys = sqliteTable("api_keys", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    key: text("key").notNull(),
    secret: text("secret").notNull(),
    dateAdded: integer("date_added").notNull(),
    lastUsed: integer("last_used"),
}, (table) => ([]));

export const signalsRelations = relations(signals, ({ many }) => ({
    takeProfits: many(takeProfits),
}));

export const takeProfitsRelations = relations(takeProfits, ({ one }) => ({
    signal: one(signals, {
        fields: [takeProfits.signalId],
        references: [signals.id],
    }),
}));