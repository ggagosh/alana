import { useEffect, useRef } from 'react';
import { useCoinStore } from '@/stores/coin-store';
import { CoinData } from '@/types/binance';

interface UseCoinDataReturn {
  coinData: CoinData | null;
  error: Error | null;
  isInitialized: boolean;
}

export function useCoinData(symbol: string): UseCoinDataReturn {
  const { initializeCoin, getCoinData, error } = useCoinStore();
  const initializeRef = useRef(false);

  useEffect(() => {
    if (!symbol) return;
    
    const initialize = async () => {
      try {
        if (!initializeRef.current) {
          initializeRef.current = true;
          
          await initializeCoin(symbol);
        }
      } catch (err) {
        console.error('Failed to initialize coin data:', err);
      }
    };

    initialize();

    // Cleanup subscription on unmount
    return () => {
      if (initializeRef.current) {
        useCoinStore.getState().unsubscribeFromSymbol(symbol);
      }
    };
  }, [symbol, initializeCoin]);

  const coinData = getCoinData(symbol);
  const isInitialized = !!coinData?.historicalData?.length;

  return {
    coinData,
    error,
    isInitialized,
  };
}
