import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Signal } from "@/types/signals"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, pair: string): string {
  // Most crypto prices should show 4-8 decimal places depending on the price magnitude
  const decimals = price < 1 ? 8 : price < 100 ? 6 : 4;
  return price.toFixed(decimals);
}

export function calculatePriceChange(current: number, entry: number): string {
  const change = ((current - entry) / entry) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}

export function checkTakeProfitHit(signal: Signal): void {
  const currentPrice = signal.currentPrice;
  
  signal.takeProfits.forEach(tp => {
    if (!tp.hit) {
      if (
        (signal.entryLow < signal.entryHigh && currentPrice >= tp.price) || 
        (signal.entryLow > signal.entryHigh && currentPrice <= tp.price)
      ) {
        tp.hit = true;
        tp.hitDate = Date.now();
      }
    }
  });
}
