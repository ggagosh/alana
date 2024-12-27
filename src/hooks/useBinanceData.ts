"use client";

import { useState, useEffect, useRef } from "react";
import { usePriceStore } from "@/stores/priceStore";

interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StreamRequest {
  method: string;
  params: string[];
  id: number;
}

interface StreamResponse {
  w?: string;  // Weighted average price
  s?: string;  // Symbol
  e?: string;  // Event type
  k?: {        // Kline data
    t: number; // Kline start time
    o: string; // Open price
    h: string; // High price
    l: string; // Low price
    c: string; // Close price
    v: string; // Volume
  };
}

interface UseBinanceDataReturn {
  data: KLineData[];
  loading: boolean;
  error: Error | null;
}

export function useBinanceData(
  symbols: string[],
  interval: string = "1m",
  limit: number = 1000
): UseBinanceDataReturn {
  const [data, setData] = useState<KLineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const updatePrice = usePriceStore(state => state.updatePrice);

  // Fetch historical data for the first symbol (if any)
  useEffect(() => {
    if (!symbols.length) return;

    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbols[0]}&interval=${interval}&limit=${limit}`
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
        if (data.length > 0) {
          setLoading(false);
        }
      }
    };

    fetchHistoricalData();
  }, [symbols, interval, limit]);

  // WebSocket connection for real-time data
  useEffect(() => {
    if (!symbols.length) return;

    const connect = () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }

      // Create new WebSocket connection
      ws.current = new WebSocket('wss://stream.binance.com:9443/ws');

      ws.current.onopen = () => {
        console.log('Connected to Binance WebSocket Stream');
        if (ws.current?.readyState === WebSocket.OPEN) {
          // Subscribe to both average price and kline streams
          const subscribeMsg: StreamRequest = {
            method: "SUBSCRIBE",
            params: [
              ...symbols.map(symbol => `${symbol.toLowerCase()}@avgPrice`),
              ...symbols.map(symbol => `${symbol.toLowerCase()}@kline_${interval}`)
            ],
            id: 1
          };
          ws.current.send(JSON.stringify(subscribeMsg));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as StreamResponse;
          
          // Handle subscription confirmation
          if ('result' in data && data.result === null && 'id' in data && data.id === 1) {
            console.log('Successfully subscribed to data streams');
            return;
          }

          // Handle average price updates
          if (data.s && data.w) {
            const price = parseFloat(data.w);
            updatePrice(data.s, price);
          }
          
          // Handle kline updates
          if (data.e === "kline" && data.k) {
            const kline = data.k;
            const newCandle: KLineData = {
              timestamp: kline.t,
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              volume: parseFloat(kline.v),
            };

            setData(prevData => {
              const lastCandle = prevData[prevData.length - 1];
              if (lastCandle && lastCandle.timestamp === newCandle.timestamp) {
                return [...prevData.slice(0, -1), newCandle];
              } else {
                return [...prevData, newCandle];
              }
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from Binance WebSocket Stream');
        reconnectTimeout.current = setTimeout(connect, 5000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (data.length === 0) {
          setError(new Error('WebSocket connection failed'));
        }
        ws.current?.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current?.readyState === WebSocket.OPEN) {
        const unsubscribeMsg: StreamRequest = {
          method: "UNSUBSCRIBE",
          params: [
            ...symbols.map(symbol => `${symbol.toLowerCase()}@avgPrice`),
            ...symbols.map(symbol => `${symbol.toLowerCase()}@kline_${interval}`)
          ],
          id: 2
        };
        ws.current.send(JSON.stringify(unsubscribeMsg));
        ws.current.close();
      }
    };
  }, [symbols, interval, updatePrice]);

  return { data, loading, error };
}
