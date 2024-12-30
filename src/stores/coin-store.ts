import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CoinData, CoinDataMap, KLineData } from '@/types/binance';
import { wsManager } from '@/lib/websocket-manager';
import { WsTradeMessage } from '@/types/websocket';

interface CoinState {
  coins: CoinDataMap;
  isConnecting: boolean;
  error: Error | null;

  // Actions
  initializeCoin: (symbol: string) => Promise<void>;
  updateCoinPrice: (symbol: string, price: number) => void;
  updateHistoricalData: (symbol: string, data: KLineData[]) => void;
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
  setError: (error: Error | null) => void;

  // Selectors
  getCoinData: (symbol: string) => CoinData | null;
  getSubscribedSymbols: () => string[];
}

const BINANCE_REST_URL = 'https://api.binance.com/api/v3';
const CANDLE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function createNewCandle(time: number, price: number): KLineData {
  return {
    openTime: time,
    open: price,
    high: price,
    low: price,
    close: price,
    volume: 0,
    closeTime: time + CANDLE_INTERVAL - 1,
  };
}

function updateCandle(candle: KLineData, price: number): KLineData {
  return {
    ...candle,
    high: Math.max(candle.high, price),
    low: Math.min(candle.low, price),
    close: price,
  };
}

export const useCoinStore = create<CoinState>()(
  devtools(
    (set, get) => ({
      coins: {},
      isConnecting: false,
      error: null,

      initializeCoin: async (symbol: string) => {
        try {
          const state = get();
          if (state.coins[symbol]?.historicalData?.length > 0) return;
          if (state.coins[symbol]?.isInitializing) return;

          const initialCoin: CoinData = {
            symbol,
            historicalData: [],
            currentPrice: 0,
            isInitializing: true,
          };

          set((state) => ({
            coins: {
              ...state.coins,
              [symbol]: initialCoin,
            },
          }));

          // Fetch historical data
          const response = await fetch(
            `${BINANCE_REST_URL}/klines?symbol=${symbol.toUpperCase()}&interval=1d&limit=30`
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch historical data: ${response.statusText}`);
          }

          const data = await response.json();
          const historicalData: KLineData[] = data.map((item: [number, string, string, string, string, string, number]) => ({
            openTime: item[0],
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5]),
            closeTime: item[6],
          }));

          const lastCandle = historicalData[historicalData.length - 1];
          const currentTime = Date.now();
          const currentCandle = createNewCandle(
            Math.floor(currentTime / CANDLE_INTERVAL) * CANDLE_INTERVAL,
            lastCandle?.close || 0
          );

          const updatedCoin: CoinData = {
            symbol,
            historicalData,
            currentPrice: lastCandle?.close || 0,
            currentCandle,
            isInitializing: false,
          };

          set((state) => ({
            coins: {
              ...state.coins,
              [symbol]: updatedCoin,
            },
          }));

          // Subscribe to real-time updates
          get().subscribeToSymbol(symbol);
        } catch (error) {
          const errorCoin: CoinData = {
            symbol,
            historicalData: [],
            currentPrice: 0,
            isInitializing: false,
          };

          set((state) => ({
            error: error instanceof Error ? error : new Error('Unknown error occurred'),
            coins: {
              ...state.coins,
              [symbol]: errorCoin,
            },
          }));
        }
      },

      updateCoinPrice: (symbol: string, price: number) => {
        set((state) => {
          const coin = state.coins[symbol];
          if (!coin) return state;

          const currentTime = Date.now();
          const candleStartTime = Math.floor(currentTime / CANDLE_INTERVAL) * CANDLE_INTERVAL;

          let currentCandle = coin.currentCandle;
          
          // Create new candle if needed
          if (!currentCandle || currentTime >= currentCandle.closeTime) {
            currentCandle = createNewCandle(candleStartTime, price);
          } else {
            currentCandle = updateCandle(currentCandle, price);
          }

          return {
            coins: {
              ...state.coins,
              [symbol]: {
                ...coin,
                currentPrice: price,
                currentCandle,
              },
            },
          };
        });
      },

      updateHistoricalData: (symbol: string, data: KLineData[]) => {
        set((state) => ({
          coins: {
            ...state.coins,
            [symbol]: {
              ...state.coins[symbol],
              historicalData: data,
            },
          },
        }));
      },

      subscribeToSymbol: (symbol: string) => {
        const channel = `${symbol.toLowerCase()}@trade`;
        wsManager.subscribe(channel, (data) => {
          if ('p' in data && data.e === 'trade') {
            const tradeData = data as WsTradeMessage;
            get().updateCoinPrice(symbol, parseFloat(tradeData.p));
          }
        });
      },

      unsubscribeFromSymbol: (symbol: string) => {
        const channel = `${symbol.toLowerCase()}@trade`;
        wsManager.unsubscribe(channel, () => { });
      },

      setError: (error: Error | null) => set({ error }),

      getCoinData: (symbol: string) => get().coins[symbol] || null,

      getSubscribedSymbols: () => Object.keys(get().coins),
    }),
    {
      name: 'coin-store',
    }
  )
);
