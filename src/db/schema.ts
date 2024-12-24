import { pgTable, text, integer, real, serial, boolean, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const signals = pgTable("signals", {
    id: serial("id").primaryKey(),
    dateAdded: date("date_added", { mode: "date" }).notNull(),
    lastPriceUpdate: date("last_price_update", { mode: "date" }),
    isActive: boolean("is_active").notNull().default(true),
    coinPair: text("coin_pair").notNull(),
    entryLow: real("entry_low").notNull(),
    entryHigh: real("entry_high").notNull(),
    currentPrice: real("current_price").notNull(),
    stopLoss: real("stop_loss").notNull(),
    dateShared: date("date_shared", { mode: "date" }).notNull(),
}, (table) => ([]));

export const takeProfits = pgTable("take_profits", {
    id: serial("id").primaryKey(),
    signalId: integer("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),
    level: integer("level").notNull(), // 1-8
    price: real("price").notNull(),
    hit: boolean("hit").notNull().default(false),
    hitDate: date("hit_date", { mode: "date" }),
}, (table) => ([]));

export const apiKeys = pgTable("api_keys", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    key: text("key").notNull(),
    secret: text("secret").notNull(),
    dateAdded: date("date_added", { mode: "date" }).notNull(),
    lastUsed: date("last_used", { mode: "date" }),
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