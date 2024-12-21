export interface Signal {
  id: number;
  coinPair: string;
  entryLow: number;
  entryHigh: number;
  currentPrice: number;
  stopLoss: number;
  dateShared: number;
  dateAdded: number;
  lastPriceUpdate: number | null;
  isActive: boolean;
  takeProfits?: TakeProfit[];
}

export interface TakeProfit {
  signalId: number;
  level: number;
  price: number;
  hit: boolean;
  hitDate: number | null;
}

export interface ParsedSignalInput {
  coinPair: string;
  text: string;
  parsed: {
    coinPair: string;
    entryLow: number;
    entryHigh: number;
    currentPrice: number;
    stopLoss: number;
    dateShared: number;
    takeProfits: Array<Omit<TakeProfit, 'id'>>;
  };
}
