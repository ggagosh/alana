"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Signal } from "@/types/signals";
import { useCryptoData } from "@/hooks/useCryptoData";

interface PriceMovementProps {
  signal: Signal;
}

export function PriceMovement({ signal }: PriceMovementProps) {
  const { data: cryptoData } = useCryptoData(signal.coinPair, "1m", 1);
  const currentPrice = cryptoData[cryptoData.length - 1]?.close || 0;

  const prices = useMemo(() => {
    const takeProfits = signal.takeProfits.map(tp => ({
      price: tp.price,
      type: "Take Profit",
      hit: currentPrice >= tp.price,
    }));

    const allPrices = [
      { price: signal.stopLoss, type: "Stop Loss", hit: currentPrice <= signal.stopLoss },
      { price: signal.entryHigh, type: "Entry", hit: currentPrice >= signal.entryHigh },
      ...takeProfits,
    ].sort((a, b) => b.price - a.price);

    // Insert current price in the correct position
    const currentPriceIndex = allPrices.findIndex(p => currentPrice > p.price);
    if (currentPriceIndex !== -1) {
      allPrices.splice(currentPriceIndex, 0, { 
        price: currentPrice, 
        type: "Current", 
        hit: false 
      });
    } else {
      allPrices.push({ price: currentPrice, type: "Current", hit: false });
    }

    return allPrices;
  }, [signal, currentPrice]);

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-medium text-sm">Price Movement</h3>
      <div className="space-y-2">
        {prices.map((price, index) => (
          <div 
            key={`${price.type}-${index}`}
            className={cn(
              "flex items-center justify-between py-1.5 px-2 rounded text-sm",
              price.type === "Current" && "bg-secondary",
              price.hit && "opacity-50"
            )}
          >
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-2 h-2 rounded-full",
                  price.type === "Stop Loss" && "bg-red-500",
                  price.type === "Entry" && "bg-blue-500",
                  price.type === "Take Profit" && "bg-green-500",
                  price.type === "Current" && "bg-yellow-500"
                )}
              />
              <span className={cn(
                price.type === "Current" && "font-medium"
              )}>
                {price.type}
              </span>
            </div>
            <span className={cn(
              "font-mono",
              price.type === "Current" && "font-medium"
            )}>
              ${price.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
