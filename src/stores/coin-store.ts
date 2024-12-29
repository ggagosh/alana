import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CoinData, CoinDataMap, KLineData } from '@/types/binance';

interface CoinState {
  coins: CoinDataMap;
  activeWebSocket: WebSocket | null;
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

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const BINANCE_REST_URL = 'https://api.binance.com/api/v3';

export const useCoinStore = create<CoinState>()(
  devtools(
    (set, get) => ({
      coins: {},
      activeWebSocket: null,
      isConnecting: false,
      error: null,

      initializeCoin: async (symbol: string) => {
        try {
          const state = get();
          // Check if coin already exists and is initialized
          if (state.coins[symbol]?.historicalData?.length > 0) return;

          // Check if we're already fetching this coin
          if (state.coins[symbol]?.isInitializing) return;

          // Mark as initializing
          set((state) => ({
            coins: {
              ...state.coins,
              [symbol]: {
                symbol,
                historicalData: [],
                currentPrice: 0,
                previousPrice: 0,
                isSubscribed: false,
                isInitializing: true,
                lastUpdated: Date.now(),
              },
            },
          }));

          // Fetch historical data
          const response = await fetch(
            `${BINANCE_REST_URL}/klines?symbol=${symbol}&interval=1m&limit=1000`
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch historical data for ${symbol}`);
          }

          const rawData = await response.json();
          const historicalData: KLineData[] = rawData.map((item: string[]) => ({
            timestamp: parseInt(item[0]),
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5]),
          }));

          // Update coin data
          set((state) => ({
            coins: {
              ...state.coins,
              [symbol]: {
                ...state.coins[symbol],
                historicalData,
                currentPrice: historicalData[historicalData.length - 1]?.close || 0,
                previousPrice: historicalData[historicalData.length - 2]?.close || 0,
                isInitializing: false,
              },
            },
          }));

          // Subscribe to real-time updates
          get().subscribeToSymbol(symbol);
        } catch (error) {
          // Clear initializing state on error
          set((state) => ({
            coins: {
              ...state.coins,
              [symbol]: {
                ...state.coins[symbol],
                isInitializing: false,
              },
            },
          }));
          get().setError(error instanceof Error ? error : new Error('Failed to initialize coin'));
        }
      },

      updateCoinPrice: (symbol: string, price: number) => {
        set((state) => ({
          coins: {
            ...state.coins,
            [symbol]: {
              ...state.coins[symbol],
              previousPrice: state.coins[symbol]?.currentPrice || price,
              currentPrice: price,
              lastUpdated: Date.now(),
            },
          },
        }));
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
        const state = get();
        if (!symbol || state.coins[symbol]?.isSubscribed) return;

        let ws = state.activeWebSocket;
        
        // Create WebSocket if it doesn't exist
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          ws = new WebSocket(BINANCE_WS_URL);
          set({ activeWebSocket: ws, isConnecting: true });

          ws.onopen = () => {
            set({ isConnecting: false });
            // Subscribe to all coins that should be subscribed
            const symbols = get().getSubscribedSymbols();
            symbols.forEach((sym) => {
              ws?.send(JSON.stringify({
                method: 'SUBSCRIBE',
                params: [`${sym.toLowerCase()}@kline_1m`],
                id: Date.now(),
              }));
            });
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.k) {
                const { s: sym, k: kline } = data;
                if (sym && kline) {
                  get().updateCoinPrice(sym, parseFloat(kline.c));
                }
              }
            } catch (error) {
              console.error('WebSocket message error:', error);
            }
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            set({ error: new Error('WebSocket connection error') });
          };

          ws.onclose = () => {
            set({ activeWebSocket: null });
            // Attempt to reconnect after a delay
            setTimeout(() => get().subscribeToSymbol(symbol), 5000);
          };
        }

        // Subscribe to the symbol
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            method: 'SUBSCRIBE',
            params: [`${symbol.toLowerCase()}@kline_1m`],
            id: Date.now(),
          }));
        }

        // Update subscription status
        set((state) => ({
          coins: {
            ...state.coins,
            [symbol]: {
              ...state.coins[symbol],
              isSubscribed: true,
            },
          },
        }));
      },

      unsubscribeFromSymbol: (symbol: string) => {
        const { activeWebSocket: ws } = get();
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            method: 'UNSUBSCRIBE',
            params: [`${symbol.toLowerCase()}@kline_1m`],
            id: Date.now(),
          }));
        }

        set((state) => ({
          coins: {
            ...state.coins,
            [symbol]: {
              ...state.coins[symbol],
              isSubscribed: false,
            },
          },
        }));
      },

      setError: (error: Error | null) => set({ error }),

      getCoinData: (symbol: string) => get().coins[symbol] || null,

      getSubscribedSymbols: () => {
        return Object.entries(get().coins)
          .filter(([_, data]) => data.isSubscribed)
          .map(([symbol]) => symbol);
      },
    }),
    {
      name: 'coin-store',
    }
  )
);
