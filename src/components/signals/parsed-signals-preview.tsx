'use client';

import { Card } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Signal } from "@/lib/schema";
import CryptoPrice from "./crypto-price";

interface ParsedSignalsPreviewProps {
  signals: Partial<Signal>[];
}

// Helper to calculate percentage difference
function calculatePercentage(current: number, target: number): number {
  return ((target - current) / current) * 100;
}

export function ParsedSignalsPreview({ signals }: ParsedSignalsPreviewProps) {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-4">Preview ({signals.length} signal{signals.length !== 1 ? 's' : ''})</h3>
      <ul className="space-y-4">
        {signals.map((signal, index) => {
          if (!signal.currentPrice || !signal.stopLoss) return null;
          const risk = calculatePercentage(signal.currentPrice, signal.stopLoss);

          return (
            <li key={index} className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">{signal.coinPair}</div>
                {signal.dateShared && (
                  <div className="text-sm text-muted-foreground">
                    {formatDistance(signal.dateShared, Date.now())} ago
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-6 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Entry Range</div>
                  <div className="font-mono">
                    <CryptoPrice price={signal.entryLow || 0} />
                    <br />
                    <CryptoPrice price={signal.entryHigh || 0} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Current Price</div>
                  <div className="font-mono">
                    <CryptoPrice price={signal.currentPrice} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">Stop Loss</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm">
                    <CryptoPrice price={signal.stopLoss} />
                  </div>
                  <Badge variant={risk < -5 ? 'destructive' : 'outline'}>
                    {Math.abs(risk).toFixed(1)}% Risk
                  </Badge>
                </div>
              </div>

              {signal.takeProfits && signal.takeProfits.length > 0 && (
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm">Take Profits</div>
                  <div className="grid grid-cols-2 gap-4">
                    {signal.takeProfits.map((tp) => {
                      if (!tp.price) return null;
                      const profit = calculatePercentage(signal.currentPrice!, tp.price);
                      return (
                        <div key={tp.level} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-sm">TP{tp.level}</span>
                            <span className="font-mono text-sm">
                              <CryptoPrice price={tp.price} />
                            </span>
                          </div>
                          <Badge variant={profit > 10 ? 'default' : 'outline'}>
                            {profit.toFixed(1)}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
