"use client";

import { Signal } from "@/types/signals";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  getSignalStatus, 
  getStatusColor, 
  calculatePnL, 
  getDistanceToNearestTP,
  getProgressColor 
} from "../utils";

interface StatusCellProps {
  signal: Signal;
}

export function StatusCell({ signal }: StatusCellProps) {
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
