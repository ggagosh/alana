"use client";

import { useEffect, useState } from "react";
import { Signal } from "@/types/signals";
import { useCoinData } from "@/hooks/use-coin-data";
import { PriceMovement } from "./price-movement";

interface PriceMovementClientProps {
  signal: Signal;
}

export function PriceMovementClient({ signal }: PriceMovementClientProps) {
  const [isClient, setIsClient] = useState(false);
  const { coinData } = useCoinData(signal.coinPair);
  const currentPrice = coinData?.currentPrice || signal.currentPrice || 0;

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
