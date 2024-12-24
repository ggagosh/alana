'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signal } from "@/types/signals";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface PriceChartProps {
  signal: Signal;
}

export function PriceChart({ signal }: PriceChartProps) {
  // Calculate price levels for visualization
  const priceLevels = [
    { price: signal.stopLoss, label: 'Stop Loss', type: 'stop' as const },
    { price: signal.entryLow, label: 'Entry', type: 'entry' as const },
    ...(signal.takeProfits || []).map(tp => ({
      price: tp.price,
      label: `TP${tp.level}`,
      type: 'tp' as const
    })),
    { price: signal.currentPrice, label: 'Current', type: 'current' as const }
  ].sort((a, b) => b.price - a.price); // Sort high to low

  // Format number to remove scientific notation and add commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
      notation: 'standard'
    }).format(value);
  };

  // Calculate percentage from current price
  const getPercentageFromCurrent = (price: number) => {
    return ((price - signal.currentPrice) / signal.currentPrice) * 100;
  };

  // Get color based on price comparison with current
  const getPriceColor = (price: number) => {
    if (price > signal.currentPrice) return 'text-green-500';
    if (price < signal.currentPrice) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-base">Price Movement Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Current price summary */}
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-1">Current Price</div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-xl">{formatNumber(signal.currentPrice)}</div>
            {signal.currentPrice > signal.entryLow ? (
              <Badge className="bg-green-500">Above Entry</Badge>
            ) : (
              <Badge variant="destructive">Below Entry</Badge>
            )}
          </div>
        </div>

        {/* Price ladder visualization */}
        <div className="space-y-2">
          {priceLevels.map((level, index) => {
            const percentFromCurrent = getPercentageFromCurrent(level.price);
            const isCurrentPrice = level.type === 'current';
            
            return (
              <div 
                key={`${level.type}-${index}`}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  isCurrentPrice ? 'bg-muted' : ''
                }`}
              >
                <div className="w-24 flex-shrink-0">
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
                    className="text-xs w-full justify-center"
                  >
                    {level.label}
                  </Badge>
                </div>
                
                <div className={`font-mono text-base flex-1 ${getPriceColor(level.price)}`}>
                  {formatNumber(level.price)}
                </div>
                
                {!isCurrentPrice && (
                  <div className={`flex items-center gap-1 text-sm ${getPriceColor(level.price)}`}>
                    {percentFromCurrent > 0 ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {Math.abs(percentFromCurrent).toFixed(2)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Risk analysis */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Risk</div>
            <div className="text-red-500 font-medium">
              {Math.abs(((signal.stopLoss - signal.currentPrice) / signal.currentPrice) * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Next Target</div>
            {signal.takeProfits?.find(tp => tp.price > signal.currentPrice) ? (
              <div className="text-green-500 font-medium">
                {Math.abs(((signal.takeProfits.find(tp => tp.price > signal.currentPrice)!.price - signal.currentPrice) / signal.currentPrice) * 100).toFixed(2)}%
              </div>
            ) : (
              <div className="text-muted-foreground">No targets above</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
