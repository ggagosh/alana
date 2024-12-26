"use client";

import { Signal } from "@/types/signals";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { PriceCell } from "./cells/PriceCell";
import { StatusCell } from "./cells/StatusCell";
import { ActionCell } from "./cells/ActionCell";
import { getPerformanceColor, getSignalStatus } from "./utils";

export function getColumns(
  onDeleteSignal?: (id: number) => Promise<void>,
  onArchiveSignal?: (id: number) => Promise<void>
): ColumnDef<Signal>[] {
  return [
    {
      accessorKey: "coinPair",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Pair
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const current = row.getValue("currentPrice") as number;
        const entryLow = row.original.entryLow;
        const change = ((current - entryLow) / entryLow) * 100;

        return (
          <div className="flex items-center gap-2">
            <div className={cn("font-medium", getPerformanceColor(change))}>
              {row.getValue("coinPair")}
            </div>
            {!row.original.isActive && (
              <Badge variant="secondary" className="text-xs">Archived</Badge>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        return row.getValue<string>(columnId).toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "entryRange",
      header: "Entry",
      cell: ({ row }) => {
        const current = row.getValue("currentPrice") as number;
        const low = row.original.entryLow;
        const high = row.original.entryHigh;
        const isInRange = current >= low && current <= high;

        return (
          <div className={cn(
            "font-mono",
            isInRange && "text-yellow-600 dark:text-yellow-400 font-medium"
          )}>
            {formatPrice(low)} - {formatPrice(high)}
          </div>
        );
      },
    },
    {
      accessorKey: "currentPrice",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Current
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <PriceCell signal={row.original} />,
    },
    {
      accessorKey: "takeProfits",
      header: "Take Profits",
      cell: ({ row }) => {
        const tps = row.original.takeProfits;
        if (!tps?.length) return null;

        const current = row.getValue("currentPrice") as number;
        const firstTP = tps[0];
        const lastTP = tps[tps.length - 1];

        const currentLevel = tps.findIndex(tp => tp.price > current);
        const isAboveAll = currentLevel === -1;
        const isBelowAll = currentLevel === 0;

        return (
          <div className="space-y-2">
            <div className="font-mono text-sm">
              {formatPrice(firstTP.price)} → {formatPrice(lastTP.price)}
            </div>
            <div className="flex items-center gap-2">
              {isAboveAll ? (
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
              Next Level: {!isAboveAll && formatPrice(tps[currentLevel]?.price)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "stopLoss",
      header: "Stop Loss",
      cell: ({ row }) => {
        const sl = row.getValue("stopLoss") as number;
        const current = row.getValue("currentPrice") as number;
        const distance = ((current - sl) / current) * 100;
        const isNearStop = Math.abs(distance) < 5;

        return (
          <div className="font-mono space-y-1">
            <div>{formatPrice(sl)}</div>
            <div className={cn(
              "text-xs",
              isNearStop ? "text-red-500" : "text-muted-foreground"
            )}>
              {Math.abs(distance).toFixed(2)}% away
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "dateShared",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Age
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatDistance(row.getValue("dateShared"), Date.now())} ago
        </div>
      ),
      filterFn: (row, columnId, columnFilters) => {
        const filterValue = columnFilters.getFilterValue(columnId);
        if (!filterValue) return true;
        return row.getValue<Date>(columnId) >= filterValue;
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusCell signal={row.original} />,
    },
    {
      id: "signal_status_filter",
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true;
        const status = getSignalStatus(row.original);
        return value.includes(status);
      }
    },
    {
      id: "tp_status_filter",
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true;
        const current = row.original.currentPrice;
        const entryLow = row.original.entryLow;
        const entryHigh = row.original.entryHigh;
        const isInRange = current >= entryLow && current <= entryHigh;

        const tps = row.original.takeProfits;
        const currentLevel = tps?.findIndex(tp => tp.price > current) ?? -1;
        const isAboveAll = currentLevel === -1;
        const isBelowAll = currentLevel === 0;

        const sl = row.original.stopLoss;
        const distance = ((current - sl) / current) * 100;
        const isNearStop = Math.abs(distance) < 5;

        return value.some((status) => {
          switch (status) {
            case "in_range": return isInRange;
            case "above_all_tp": return isAboveAll;
            case "below_all_tp": return isBelowAll;
            case "near_stop": return isNearStop;
            default: return false;
          }
        });
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionCell
          signal={row.original}
          onDeleteSignal={onDeleteSignal}
          onArchiveSignal={onArchiveSignal}
        />
      ),
    },
  ];
}
