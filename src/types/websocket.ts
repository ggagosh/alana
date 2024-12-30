import { z } from 'zod';

export const wsTradeMessageSchema = z.object({
  e: z.literal('trade'),
  E: z.number(),
  s: z.string(),
  t: z.number(),
  p: z.string(),
  q: z.string(),
  b: z.number().optional(),
  a: z.number().optional(),
  T: z.number(),
  m: z.boolean(),
  M: z.boolean()
});

export type WsTradeMessage = z.infer<typeof wsTradeMessageSchema>;

export const wsKlineMessageSchema = z.object({
  e: z.literal('kline'),
  E: z.number(),
  s: z.string(),
  k: z.object({
    t: z.number(),
    T: z.number(),
    s: z.string(),
    i: z.string(),
    f: z.number(),
    L: z.number(),
    o: z.string(),
    c: z.string(),
    h: z.string(),
    l: z.string(),
    v: z.string(),
    n: z.number(),
    x: z.boolean(),
    q: z.string(),
    V: z.string(),
    Q: z.string(),
    B: z.string()
  })
});

export type WsKlineMessage = z.infer<typeof wsKlineMessageSchema>;

export type WsMessage = WsTradeMessage | WsKlineMessage;

export interface WsSubscribeMessage {
  method: 'SUBSCRIBE';
  params: string[];
  id: number;
}

export interface WsUnsubscribeMessage {
  method: 'UNSUBSCRIBE';
  params: string[];
  id: number;
}

export type WsRequestMessage = WsSubscribeMessage | WsUnsubscribeMessage;

export type WsResponseMessage = {
  result: null;
  id: number;
} | {
  error: {
    code: number;
    msg: string;
  };
  id: number;
};
