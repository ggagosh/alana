import { pgTable, text, integer, real, serial, boolean, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase"

export const signals = pgTable("signals", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    dateAdded: timestamp("date_added", { mode: "date" }).notNull(),
    lastPriceUpdate: timestamp("last_price_update", { mode: "date" }),
    isActive: boolean("is_active").notNull().default(true),
    coinPair: text("coin_pair").notNull(),
    entryLow: real("entry_low").notNull(),
    entryHigh: real("entry_high").notNull(),
    currentPrice: real("current_price").notNull(),
    stopLoss: real("stop_loss").notNull(),
    dateShared: timestamp("date_shared", { mode: "date" }).notNull(),
}, (table) => ([]));

export const takeProfits = pgTable("take_profits", {
    id: serial("id").primaryKey(),
    signalId: integer("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),
    level: integer("level").notNull(), // 1-8
    price: real("price").notNull(),
    hit: boolean("hit").notNull().default(false),
    hitDate: timestamp("hit_date", { mode: "date" }),
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

export const usersSignalsRelations = relations(authUsers, ({ many }) => ({
    signals: many(signals),
}));

export const coinPriceHistory = pgTable("coin_price_history", {
    id: serial("id").primaryKey(),
    coinPair: text("coin_pair").notNull(),
    date: timestamp("date", { mode: "date" }).notNull(),
    price: real("price").notNull(),
}, (table) => ([
    {
        coinPairIdx: index("coin_pair_date_idx").on(table.coinPair, table.date),
    }
]));