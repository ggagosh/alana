import { z } from "zod";

export const takeProfitSchema = z.object({
  level: z.number(),
  price: z.number(),
  hit: z.boolean().default(false),
  hitDate: z.date().nullable().default(null),
});

export const signalSchema = z.object({
  coinPair: z.string(),
  entryLow: z.number(),
  entryHigh: z.number(),
  currentPrice: z.number(),
  stopLoss: z.number(),
  dateShared: z.coerce.date(),
  takeProfits: z.array(takeProfitSchema),
});

export const parsedSignalSchema = z.object({
  parsed: signalSchema,
});

export type ParsedSignal = z.infer<typeof parsedSignalSchema>;
export type Signal = z.infer<typeof signalSchema>;
