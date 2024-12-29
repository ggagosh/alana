"use client";

import { Signal } from "@/types/signals";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CryptoPrice from "@/components/signals/crypto-price";
import {
    ArrowUp,
    ArrowDown
} from "lucide-react"

import { Progress } from "@/components/ui/progress";
import { usePriceStore } from "@/stores/priceStore";
import { Row } from "@tanstack/react-table";


interface SignalTableCellProps {
    row: Row<Signal>;
    type:
      | "pair"
      | "entryRange"
      | "currentPrice"
      | "takeProfits"
      | "stopLoss"
      | "dateShared"
      | "status";
}
export function SignalTableCell({
  row,
    type
}: SignalTableCellProps) {
  const currentPrice = usePriceStore(state => state.getPriceBySymbol(row.original.coinPair));
  const previousPrice = usePriceStore(state => state.getPreviousPriceBySymbol(row.original.coinPair));
  
  switch (type) {
    case "pair": {
        const current = row.getValue("currentPrice") as number;
        const entryLow = row.original.entryLow;
        const change = ((current - entryLow) / entryLow) * 100;
    
            return (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "font-medium",
                    getPerformanceColor(change)
                  )}>
                    {row.getValue("coinPair")}
                  </div>
                  {!row.original.isActive && (
                    <Badge variant="secondary" className="text-xs">Archived</Badge>
                  )}
                </div>
              );
    }
      case "entryRange": {
        const current = row.getValue("currentPrice") as number;
        const low = row.original.entryLow;
        const high = row.original.entryHigh;
        const isInRange = current >= low && current <= high;

        return (
          <div className={cn(
            "font-mono",
            isInRange && "text-yellow-600 dark:text-yellow-400 font-medium"
          )}>
            <CryptoPrice price={low.toString()} />
            <span className="mx-1">-</span>
            <CryptoPrice price={high.toString()} />
          </div>
        );
      }
    case "currentPrice": {
      const signal = row.original;
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
                  <CryptoPrice price={currentPrice || signal.currentPrice} />
              </div>
              </div>
              <div className={cn(getPerformanceColor(changeFromEntry))}>
              {changeFromEntry > 0 ? "+" : ""}
              {changeFromEntry.toFixed(2)}%
              </div>
          </div>
      );
    }
    case "takeProfits": {
      const tps = row.original.takeProfits;
      if (!tps?.length) return null;
    
      const current = row.getValue("currentPrice") as number;
      const firstTP = tps[0];
      const lastTP = tps[tps.length - 1];
      const sl = row.original.stopLoss;
      const isBelowSL = current < sl;

      // Find the TP levels we're between
      const currentLevel = tps.findIndex(tp => tp.price > current);
      const isAboveAll = currentLevel === -1;
      const isBelowAll = currentLevel === 0;

      return (
        <div className="space-y-2">
          <div className="font-mono text-sm">
            <CryptoPrice price={firstTP.price.toString()} />
            <span className="mx-1">→</span>
            <CryptoPrice price={lastTP.price.toString()} />
          </div>
          <div className="flex items-center gap-2">
            {isBelowSL ? (
              <Badge variant="destructive">Below StopLoss</Badge>
            ) : isAboveAll ? (
              <Badge className="bg-green-500">Above All TPs</Badge>
            ) : isBelowAll ? (
              <Badge variant="outline">Below All TPs</Badge>
            ) : (
              <Badge variant="secondary">
                Between TP{currentLevel} and TP{currentLevel + 1}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Next Level: {!isAboveAll && !isBelowSL && <CryptoPrice price={tps[currentLevel]?.price} />}
          </div>
        </div>
      );
    }
      case "stopLoss": {
        const sl = row.getValue("stopLoss") as number;
        const current = row.getValue("currentPrice") as number;
        const distance = ((current - sl) / current) * 100;
        const isNearStop = Math.abs(distance) < 5; // Within 5% of stop loss

        return (
          <div className="font-mono space-y-1">
            <div>
              <CryptoPrice price={sl.toString()} />
            </div>
            <div
              className={cn(
                "text-xs",
                isNearStop ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {Math.abs(distance).toFixed(2)}% away
            </div>
          </div>
        );
      }
      case "dateShared":
        return (
          <div className="text-muted-foreground">
            {formatDistance(row.getValue("dateShared"), Date.now())} ago
          </div>
        );
      case "status": {
        const signal = row.original;
        const status = getSignalStatus(signal);
        const pnl = calculatePnL(signal);
        const nearestTP = getDistanceToNearestTP(signal);
        const hitTPCount = signal.takeProfits?.filter(tp => tp.hit).length ?? 0;
        const totalTPCount = signal.takeProfits?.length ?? 0;
        const successRate = totalTPCount > 0 ? (hitTPCount / totalTPCount) * 100 : 0;

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={cn("capitalize", getStatusColor(status))}>
                {status.replace("_", " ")}
              </Badge>
              {pnl !== null && (
                <Badge
                  variant={pnl >= 0 ? "default" : "destructive"}
                  className={cn(
                    pnl >= 10 && "bg-green-600 dark:bg-green-500",
                    pnl >= 5 && pnl < 10 && "bg-green-500 dark:bg-green-400",
                    pnl < 0 && pnl > -5 && "bg-red-500 dark:bg-red-400",
                    pnl <= -5 && "bg-red-600 dark:bg-red-500"
                  )}
                >
                  {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%
                </Badge>
              )}
            </div>

            {nearestTP && (
              <div className={cn(
                "text-sm",
                nearestTP.distance <= 1 ? "text-yellow-600 dark:text-yellow-400 font-medium" :
                  nearestTP.distance <= 3 ? "text-blue-600 dark:text-blue-400" :
                    "text-muted-foreground"
              )}>
                TP{nearestTP.level}: {Math.abs(nearestTP.distance).toFixed(1)}% {nearestTP.distance >= 0 ? "above" : "below"}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span className={cn(
                  successRate >= 75 && "text-green-600 dark:text-green-400",
                  successRate >= 50 && successRate < 75 && "text-blue-600 dark:text-blue-400",
                  successRate >= 25 && successRate < 50 && "text-yellow-600 dark:text-yellow-400"
                )}>
                  {hitTPCount}/{totalTPCount} TPs
                </span>
              </div>
              <Progress
                value={successRate}
                className="h-1"
                indicatorClassName={getProgressColor(successRate)}
              />
              {hitTPCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  Last hit: {signal.takeProfits
                    .filter(tp => tp.hit)
                    .sort((a, b) => (b.hitDate?.getTime() ?? 0) - (a.hitDate?.getTime() ?? 0))[0]
                    ?.hitDate?.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        );
      }
    default:
        return null;
    }
}

type SignalStatus = "pre_entry" | "in_entry" | "active" | "closed";
function getSignalStatus(signal: Signal): SignalStatus {
    const current = signal.currentPrice;
    const { entryLow, entryHigh, takeProfits } = signal;
  
    // Check if all TPs are hit
    const allTPsHit = takeProfits?.every(tp => tp.hit) ?? false;
    if (allTPsHit) return "closed";
  
    // Check if we're in entry zone
    if (current >= entryLow && current <= entryHigh) return "in_entry";
  
    // Check if position is active (price has been in entry zone)
    const hasHitTPs = takeProfits?.some(tp => tp.hit) ?? false;
    if (hasHitTPs) return "active";
  
    // If none of the above, we're pre-entry
    return "pre_entry";
  }
  
function getStatusColor(status: SignalStatus): string {
    switch (status) {
        case "pre_entry": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
        case "in_entry": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        case "closed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
}
  
function getPerformanceColor(value: number): string {
    if (value >= 10) return "text-green-600 dark:text-green-400 font-medium";
    if (value > 0) return "text-green-500 dark:text-green-300";
    if (value < -5) return "text-red-600 dark:text-red-400 font-medium";
    if (value < 0) return "text-red-500 dark:text-red-300";
    return "text-slate-600 dark:text-slate-400";
}
  
function getProgressColor(percentage: number): string {
    if (percentage >= 75) return "bg-green-600 dark:bg-green-500";
    if (percentage >= 50) return "bg-blue-600 dark:bg-blue-500";
    if (percentage >= 25) return "bg-yellow-600 dark:bg-yellow-500";
    return "bg-slate-600 dark:bg-slate-500";
}
  
function calculatePnL(signal: Signal): number | null {
    const hitTPs = signal.takeProfits?.filter(tp => tp.hit) ?? [];
    if (!hitTPs.length) return null;
  
    // Calculate average entry price
    const entryPrice = (signal.entryLow + signal.entryHigh) / 2;
  
    // Calculate average exit price from hit TPs
    const avgExitPrice = hitTPs.reduce((sum, tp) => sum + tp.price, 0) / hitTPs.length;
  
    return ((avgExitPrice - entryPrice) / entryPrice) * 100;
}
  
function getDistanceToNearestTP(signal: Signal): { distance: number; level: number } | null {
    const current = signal.currentPrice;
    const unHitTPs = signal.takeProfits?.filter(tp => !tp.hit).sort((a, b) => a.price - b.price) ?? [];
  
    if (!unHitTPs.length) return null;
  
    const nearestTP = unHitTPs[0];
    const distance = ((nearestTP.price - current) / current) * 100;
  
    return {
      distance,
      level: nearestTP.level
    };
  }