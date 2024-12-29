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
      if (!initializeRef.current) {
        initializeRef.current = true;
        await initializeCoin(symbol);
      }
    };

    initialize();
  }, [symbol, initializeCoin]);

  const coinData = getCoinData(symbol);
  const isInitialized = !!coinData?.historicalData?.length;

  return {
    coinData,
    error,
    isInitialized,
  };
}
