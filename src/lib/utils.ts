import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Signal } from "@/types/signals"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  // Handle undefined or null
  if (price == null) return "-";

  // Convert scientific notation to decimal
  const normalizedPrice = Number(price).toString();
  
  // If it's a small number in scientific notation
  if (normalizedPrice.includes('e')) {
    return Number(price).toFixed(8);
  }

  // For regular numbers, keep up to 8 decimal places
  const [whole, decimal] = normalizedPrice.split('.');
  if (!decimal) return whole;

  // Trim trailing zeros
  const trimmedDecimal = decimal.replace(/0+$/, '');
  return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole;
}

export function calculatePriceChange(current: number, entry: number): string {
  const change = ((current - entry) / entry) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}

export function checkTakeProfitHit(signal: Signal): void {
  const currentPrice = signal.currentPrice;
  
  signal?.takeProfits?.forEach(tp => {
    if (!tp.hit) {
      if (
        (signal.entryLow < signal.entryHigh && currentPrice >= tp.price) || 
        (signal.entryLow > signal.entryHigh && currentPrice <= tp.price)
      ) {
        tp.hit = true;
        tp.hitDate = new Date();
      }
    }
  });
}
