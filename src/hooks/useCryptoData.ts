import { useState, useEffect } from "react";

interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UseCryptoDataReturn {
  data: KLineData[];
  loading: boolean;
  error: Error | null;
  ws: WebSocket | null;
}

export function useCryptoData(symbol: string, interval: string = "1m", limit: number = 1000): UseCryptoDataReturn {
  const [data, setData] = useState<KLineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch historical data
  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.json();
      const formattedData: KLineData[] = rawData.map((item: any[]) => ({
        timestamp: item[0],
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
      }));
      
      setData(formattedData);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching historical data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      // Don't set loading to false if we have no data
      if (data.length > 0) {
        setLoading(false);
      }
    }
  };

  // Setup WebSocket with reconnection logic
  const setupWebSocket = () => {
    const wsInstance = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`
    );

    wsInstance.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.e === "kline") {
        const { k: kline } = message;
        const newCandle: KLineData = {
          timestamp: kline.t,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
        };

        setData((prevData) => {
          const lastCandle = prevData[prevData.length - 1];
          if (lastCandle && lastCandle.timestamp === newCandle.timestamp) {
            return [...prevData.slice(0, -1), newCandle];
          } else {
            return [...prevData, newCandle];
          }
        });
      }
    };

    wsInstance.onopen = () => {
      console.log("WebSocket connected");
      setError(null);
    };

    wsInstance.onerror = (err) => {
      console.warn("WebSocket error:", err);
      // Don't set error if we have data
      if (data.length === 0) {
        setError(new Error('WebSocket connection failed'));
      }
    };

    wsInstance.onclose = () => {
      console.log("WebSocket closed, attempting to reconnect...");
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (wsInstance.readyState === WebSocket.CLOSED) {
          setupWebSocket();
        }
      }, 5000);
    };

    setWs(wsInstance);
    return wsInstance;
  };

  useEffect(() => {
    // Initial data fetch
    fetchHistoricalData();

    // Setup WebSocket
    const wsInstance = setupWebSocket();

    // Periodic data refresh (every 5 minutes)
    const refreshInterval = setInterval(fetchHistoricalData, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      if (wsInstance) {
        wsInstance.close();
      }
    };
  }, [symbol, interval, limit]);

  return { data, loading, error, ws };
}
