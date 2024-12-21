'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signal, TakeProfit } from "@/types/signals";
import { formatPrice } from "@/lib/utils";
import { updateTakeProfit } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

interface TakeProfitsProgressProps {
  signal: Signal;
}

export function TakeProfitsProgress({ signal }: TakeProfitsProgressProps) {
  const handleToggleTP = async (tp: TakeProfit) => {
    try {
      await updateTakeProfit(tp.id, !tp.hit);
    } catch (error) {
      console.error('Failed to update TP:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Profits Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signal.takeProfits
            .sort((a, b) => a.level - b.level)
            .map((tp) => (
              <div
                key={tp.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleTP(tp)}
                  >
                    {tp.hit ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <div>
                    <p className="font-medium">TP {tp.level}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(tp.price, signal.coinPair)}
                    </p>
                  </div>
                </div>
                {tp.hit && tp.hitDate && (
                  <p className="text-sm text-muted-foreground">
                    Hit on {new Date(tp.hitDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
