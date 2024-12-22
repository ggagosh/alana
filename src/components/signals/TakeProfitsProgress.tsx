'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signal, TakeProfit } from "@/types/signals";
import { formatPrice } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TakeProfitsProgressProps {
  signal: Signal;
}

export function TakeProfitsProgress({ signal }: TakeProfitsProgressProps) {
  const sortedTPs = signal.takeProfits?.sort((a, b) => a.level - b.level) || [];
  const currentLevel = sortedTPs.findIndex(tp => tp.price > signal.currentPrice);
  const isAboveAll = currentLevel === -1;
  const isBelowAll = currentLevel === 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-base">Take Profit Levels</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-1">
          {sortedTPs.map((tp, index) => {
            const isPriceHere = 
              (index === currentLevel - 1) || 
              (index === sortedTPs.length - 1 && isAboveAll);
            
            const priceChange = ((tp.price - signal.currentPrice) / signal.currentPrice) * 100;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-md ${
                  isPriceHere ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">TP {tp.level}</p>
                      {isPriceHere && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatPrice(tp.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {signal.currentPrice < tp.price ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={signal.currentPrice < tp.price ? "text-green-500" : "text-red-500"}>
                    {Math.abs(priceChange).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
