"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Signal } from "@/types/signals";
import { useBinanceData } from "@/hooks/useBinanceData";
import CryptoPrice from "./crypto-price";

interface PriceMovementProps {
  signal: Signal;
  initialPrices: Array<{
    price: number;
    type: string;
    hit: boolean;
    percentage: string;
  }>;
}

const calculatePercentage = (price: number, currentPrice: number) => {
  if (currentPrice === 0) return "0.00";
  const percentage = ((price - currentPrice) / currentPrice * 100);
  if (!isFinite(percentage)) return "0.00";
  return percentage.toFixed(2);
};

function getPrices(signal: Signal, currentPrice: number) {
  const takeProfits = signal.takeProfits.map(tp => ({
    price: tp.price,
    type: "Take Profit",
    hit: currentPrice >= tp.price,
    percentage: calculatePercentage(tp.price, currentPrice)
  }));

  const allPrices = [
    { 
      price: signal.stopLoss, 
      type: "Stop Loss", 
      hit: currentPrice <= signal.stopLoss,
      percentage: calculatePercentage(signal.stopLoss, currentPrice)
    },
    { 
      price: signal.entryHigh, 
      type: "Entry", 
      hit: currentPrice >= signal.entryHigh,
      percentage: calculatePercentage(signal.entryHigh, currentPrice)
    },
    ...takeProfits,
  ].sort((a, b) => b.price - a.price);

  // Insert current price in the correct position
  if (currentPrice > 0) {
    const currentPriceIndex = allPrices.findIndex(p => currentPrice > p.price);
    if (currentPriceIndex !== -1) {
      allPrices.splice(currentPriceIndex, 0, { 
        price: currentPrice, 
        type: "Current", 
        hit: false,
        percentage: "0.00"
      });
    } else {
      allPrices.push({ 
        price: currentPrice, 
        type: "Current", 
        hit: false,
        percentage: "0.00"
      });
    }
  }

  return allPrices;
}

export function PriceMovement({ signal, initialPrices }: PriceMovementProps) {
  const [isClient, setIsClient] = useState(false);
  const { data: cryptoData } = useBinanceData([signal.coinPair], "1m", 1);
  const currentPrice = cryptoData[cryptoData.length - 1]?.close || signal.currentPrice || 0;
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const prices = isClient ? getPrices(signal, currentPrice) : initialPrices;

  return (
    <Card className="p-4 space-y-2">
      <h3 className="font-medium text-sm">Price Movement</h3>
      <div className="space-y-1">
        {prices.map((price, index) => (
          <div 
            key={`${price.type}-${index}`}
            className={cn(
              "py-1 px-2 rounded",
              price.type === "Current" && "bg-secondary",
              price.hit && "opacity-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    price.type === "Stop Loss" && "bg-red-500",
                    price.type === "Entry" && "bg-blue-500",
                    price.type === "Take Profit" && "bg-green-500",
                    price.type === "Current" && "bg-yellow-500"
                  )}
                />
                <span className={cn(
                  "text-sm",
                  price.type === "Current" && "font-medium"
                )}>
                  {price.type}
                </span>
              </div>
              <div className="text-right">
                <div className={cn(
                  "font-mono text-sm",
                  price.type === "Current" && "font-medium"
                )}>
                  <CryptoPrice price={price.price} />
                </div>
                <div className={cn(
                  "text-xs font-medium leading-none mt-0.5",
                  "h-[1.25rem]",
                  price.type !== "Current" && (Number(price.percentage) > 0 ? "text-green-500" : "text-red-500")
                )}>
                  {price.type !== "Current" && (
                    <>{Number(price.percentage) > 0 ? "+" : ""}{price.percentage}%</>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
