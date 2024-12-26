"use client";

import { useEffect, useRef } from "react";
import { usePriceStore } from "@/stores/priceStore";

interface StreamRequest {
  method: string;
  params: string[];
  id: number;
}

interface StreamResponse {
  w: string;  // Weighted average price
  s: string;  // Symbol
}

export function useBinanceWebSocket(symbols: string[]) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>(null);
  const updatePrice = usePriceStore(state => state.updatePrice);

  useEffect(() => {
    if (!symbols.length) return;

    const connect = () => {
      // Close existing connection if any
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }

      // Create new WebSocket connection
      ws.current = new WebSocket('wss://stream.binance.com:9443/ws');

      ws.current.onopen = () => {
        console.log('Connected to Binance WebSocket Stream');
        // Subscribe to average price streams
        if (ws.current?.readyState === WebSocket.OPEN) {
          const subscribeMsg: StreamRequest = {
            method: "SUBSCRIBE",
            params: symbols.map(symbol => `${symbol.toLowerCase()}@avgPrice`),
            id: 1
          };
          ws.current.send(JSON.stringify(subscribeMsg));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle subscription confirmation
          if (data.result === null && data.id === 1) {
            console.log('Successfully subscribed to price streams');
            return;
          }

          // Handle price updates
          const response = data as StreamResponse;
          if (response && response.s && response.w) {
            const price = parseFloat(response.w);
            updatePrice(response.s, price);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from Binance WebSocket Stream');
        // Attempt to reconnect after 5 seconds
        reconnectTimeout.current = setTimeout(connect, 5000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.current?.close();
      };
    };

    connect();

    // Cleanup function
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current?.readyState === WebSocket.OPEN) {
        // Unsubscribe before closing
        const unsubscribeMsg: StreamRequest = {
          method: "UNSUBSCRIBE",
          params: symbols.map(symbol => `${symbol.toLowerCase()}@avgPrice`),
          id: 2
        };
        ws.current.send(JSON.stringify(unsubscribeMsg));
        ws.current.close();
      }
    };
  }, [symbols, updatePrice]); // Include updatePrice in dependencies
}
