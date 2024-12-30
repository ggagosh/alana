export interface KLineData {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface CoinData {
  symbol: string;
  historicalData: KLineData[];
  currentPrice: number;
  currentCandle?: KLineData;
  isInitializing?: boolean;
}

export type CoinDataMap = Record<string, CoinData>;
