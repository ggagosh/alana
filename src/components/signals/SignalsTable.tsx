"use client";

import { Signal } from "@/types/signals";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useMemo, memo } from "react";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, ExternalLink, Copy, MoreHorizontal, Trash2, RefreshCw, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignalsTableToolbar } from "./SignalsTableToolbar";
import { Progress } from "@/components/ui/progress";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { usePriceStore } from "@/stores/priceStore";

interface SignalsTableProps {
  signals: Signal[];
  onDeleteSignal?: (id: number) => Promise<void>;
  onArchiveSignal?: (id: number) => Promise<void>;
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

const PriceCell = memo(({ signal }: { signal: Signal }) => {
  const currentPrice = usePriceStore(state => state.getPriceBySymbol(signal.coinPair));
  const previousPrice = usePriceStore(state => state.getPreviousPriceBySymbol(signal.coinPair));
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
          <span>{formatPrice(currentPrice || signal.currentPrice)}</span>
        </div>
      </div>
      <div className={cn(getPerformanceColor(changeFromEntry))}>
        {changeFromEntry > 0 ? "+" : ""}
        {changeFromEntry.toFixed(2)}%
      </div>
    </div>
  );
});
PriceCell.displayName = 'PriceCell';

export function SignalsTable({
  signals,
  onDeleteSignal,
  onArchiveSignal
}: SignalsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract unique coin pairs for WebSocket subscription
  const symbols = useMemo(() =>
    Array.from(new Set(signals.map(s => s.coinPair))),
    [signals]
  );

  // Subscribe to WebSocket updates
  useBinanceWebSocket(symbols);

  const columns: ColumnDef<Signal>[] = useMemo(() => [
    {
      accessorKey: "coinPair",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Pair
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
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
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) {
          return true;
        }

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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Current
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
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

        // Find the TP levels we're between
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
        const isNearStop = Math.abs(distance) < 5; // Within 5% of stop loss

        return (
          <div className="font-mono space-y-1">
            <div>{formatPrice(sl)}</div>
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
      },
    },
    {
      accessorKey: "dateShared",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Age
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {formatDistance(row.getValue("dateShared"), Date.now())} ago
          </div>
        );
      },
      filterFn: (row, columnId, columnFilters) => {
        const filterValue = columnFilters.getFilterValue(columnId);
        if (!filterValue) return true;

        return row.getValue<Date>(columnId) >= filterValue;
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
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
      },
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
            case "in_range":
              return isInRange;
            case "above_all_tp":
              return isAboveAll;
            case "below_all_tp":
              return isBelowAll;
            case "near_stop":
              return isNearStop;
            default:
              return false;
          }
        });
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const signal = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/signals/${row.original.id}`} passHref>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(signal.coinPair)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy pair name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const url = `https://www.binance.com/en/trade/${signal.coinPair}`;
                window.open(url, '_blank');
              }}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Binance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onArchiveSignal && (
                <DropdownMenuItem
                  onClick={() => onArchiveSignal(signal.id)}
                  className="text-yellow-600"
                >
                  {signal.isActive ? 'Archive signal' : 'Unarchive signal'}
                </DropdownMenuItem>
              )}
              {onDeleteSignal && (
                <DropdownMenuItem
                  onClick={() => onDeleteSignal(signal.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete signal
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []); // Empty dependency array since columns structure doesn't change

  const table = useReactTable({
    data: signals, // Use original signals instead of updatedSignals
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <SignalsTableToolbar table={table} coins={Array.from(new Set(signals.map(s => s.coinPair))).sort()} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No signals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}