'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signal } from "@/types/signals";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface PriceChartProps {
  signal: Signal;
}

export function PriceChart({ signal }: PriceChartProps) {
  // Calculate price levels for visualization
  const priceLevels = [
    { price: signal.stopLoss, label: 'Stop Loss', type: 'stop' as const },
    { price: signal.entryLow, label: 'Entry', type: 'entry' as const },
    { price: signal.currentPrice, label: 'Current', type: 'current' as const },
    ...(signal.takeProfits || []).map(tp => ({
      price: tp.price,
      label: `TP${tp.level}`,
      type: 'tp' as const
    }))
  ].sort((a, b) => a.price - b.price);

  // Calculate percentages from current price
  const getPercentageFromCurrent = (price: number) => {
    return ((price - signal.currentPrice) / signal.currentPrice) * 100;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-base">Price Movement Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Current position summary */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Current Position</div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-base">{formatPrice(signal.currentPrice)}</div>
            {signal.currentPrice > signal.entryLow ? (
              <Badge className="bg-green-500">Above Entry</Badge>
            ) : (
              <Badge variant="destructive">Below Entry</Badge>
            )}
          </div>
        </div>

        {/* Price ladder */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Price Ladder</div>
          <div className="space-y-1">
            {priceLevels.map((level, index) => {
              const percentFromCurrent = getPercentageFromCurrent(level.price);
              const isCurrentPrice = level.type === 'current';
              
              return (
                <div 
                  key={`${level.type}-${index}`}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    isCurrentPrice ? 'bg-muted' : ''
                  }`}
                >
                  <div className="w-20">
                    <Badge 
                      variant={
                        level.type === 'stop' 
                          ? 'destructive'
                          : level.type === 'entry'
                          ? 'secondary'
                          : level.type === 'current'
                          ? 'outline'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {level.label}
                    </Badge>
                  </div>
                  
                  <div className="font-mono text-sm">{formatPrice(level.price)}</div>
                  
                  {!isCurrentPrice && (
                    <div className={`flex items-center gap-1 text-xs ml-auto ${
                      percentFromCurrent > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <ArrowRight className="h-3 w-3" />
                      {Math.abs(percentFromCurrent).toFixed(2)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk analysis */}
        <div className="border-t pt-3">
          <div className="text-sm text-muted-foreground mb-2">Risk Analysis</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Risk</div>
              <div className="text-red-500 font-medium">
                {Math.abs(getPercentageFromCurrent(signal.stopLoss)).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Next Target</div>
              {signal.takeProfits?.find(tp => tp.price > signal.currentPrice) ? (
                <div className="text-green-500 font-medium">
                  {Math.abs(getPercentageFromCurrent(
                    signal.takeProfits.find(tp => tp.price > signal.currentPrice)!.price
                  )).toFixed(2)}%
                </div>
              ) : (
                <div className="text-muted-foreground">No targets above</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
