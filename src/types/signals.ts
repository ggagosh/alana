export interface Signal {
  id: number;
  coinPair: string;
  entryLow: number;
  entryHigh: number;
  currentPrice: number;
  stopLoss: number;
  dateShared: Date;
  dateAdded: Date;
  lastPriceUpdate: Date | null;
  isActive: boolean;
  takeProfits: TakeProfit[];
}

export interface TakeProfit {
  signalId: number;
  level: number;
  price: number;
  hit: boolean;
  hitDate: Date | null;
}
