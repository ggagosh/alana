"use client";

import { Signal } from "@/types/signals";
import { usePriceStore } from "@/stores/priceStore";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getPerformanceColor } from "../utils";
import { memo } from "react";

interface PriceCellProps {
  signal: Signal;
}

export const PriceCell = memo(({ signal }: PriceCellProps) => {
  const currentPrice = usePriceStore(state => state.getPriceBySymbol(signal.coinPair));
  const previousPrice = usePriceStore(state => state.getPreviousPriceBySymbol(signal.coinPair));
  const changeFromEntry = currentPrice
    ? ((currentPrice - signal.entryLow) / signal.entryLow) * 100
    : ((signal.currentPrice - signal.entryLow) / signal.entryLow) * 100;

  const priceMovement = previousPrice
    ? currentPrice && currentPrice > previousPrice ? 'up' : 'down'
    : 'neutral';

  return (
    <div className="font-mono space-y-1">
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center transition-colors duration-300",
          priceMovement === 'up' && "text-green-500 dark:text-green-400",
          priceMovement === 'down' && "text-red-500 dark:text-red-400"
        )}>
          {priceMovement !== 'neutral' && (
            <span className={cn(
              "mr-1 transition-transform duration-300",
              priceMovement === 'up' && "animate-slide-up",
              priceMovement === 'down' && "animate-slide-down"
            )}>
              {priceMovement === 'up' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </span>
          )}
          <span>{formatPrice(currentPrice || signal.currentPrice)}</span>
        </div>
      </div>
      <div className={cn(getPerformanceColor(changeFromEntry))}>
        {changeFromEntry > 0 ? "+" : ""}
        {changeFromEntry.toFixed(2)}%
      </div>
    </div>
  );
});

PriceCell.displayName = 'PriceCell';
