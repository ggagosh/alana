"use client";

import { useEffect, useState } from "react";
import { Signal } from "@/types/signals";
import { useCryptoData } from "@/hooks/useCryptoData";
import { PriceMovement } from "./PriceMovement";

interface PriceMovementClientProps {
  signal: Signal;
}

export function PriceMovementClient({ signal }: PriceMovementClientProps) {
  const [isClient, setIsClient] = useState(false);
  const { data: cryptoData } = useCryptoData(signal.coinPair, "1m", 1);
  const currentPrice = cryptoData[cryptoData.length - 1]?.close || signal.currentPrice || 0;

  // After hydration, mark as client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <PriceMovement signal={signal} initialPrices={[]} />;
  }

  // After hydration, pass the real-time price
  return (
    <PriceMovement 
      signal={{
        ...signal,
        currentPrice: currentPrice
      }}
      initialPrices={[]} 
    />
  );
}