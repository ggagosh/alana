import { Signal } from "@/types/signals";
import { PriceMovement } from "./price-movement";

function calculatePercentage(price: number, currentPrice: number) {
  if (currentPrice === 0) return "0.00";
  const percentage = ((price - currentPrice) / currentPrice * 100);
  if (!isFinite(percentage)) return "0.00";
  return percentage.toFixed(2);
}

function getInitialPrices(signal: Signal) {
  const currentPrice = signal.currentPrice || 0;
  
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

export function PriceMovementWrapper({ signal }: { signal: Signal }) {
  const initialPrices = getInitialPrices(signal);
  
  return <PriceMovement signal={signal} initialPrices={initialPrices} />;
}
