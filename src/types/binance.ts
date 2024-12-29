export interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StreamRequest {
  method: string;
  params: string[];
  id: number;
}

export interface KlineStreamData {
  t: number;  // Kline start time
  o: string;  // Open price
  h: string;  // High price
  l: string;  // Low price
  c: string;  // Close price
  v: string;  // Volume
}

export interface StreamResponse {
  w?: string;         // Weighted average price
  s?: string;         // Symbol
  e?: string;         // Event type
  k?: KlineStreamData;
}

export interface CoinData {
  symbol: string;
  historicalData: KLineData[];
  currentPrice: number;
  previousPrice: number;
  isSubscribed: boolean;
  isInitializing: boolean;
  lastUpdated: number;
}

export type CoinDataMap = Record<string, CoinData>;
