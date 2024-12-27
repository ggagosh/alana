import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculatePriceChange(current: number, entry: number): string {
  const change = ((current - entry) / entry) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}
