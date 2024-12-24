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
import { useState } from "react";
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
import { Eye, ExternalLink, Copy, MoreHorizontal, Trash2, RefreshCw, Search, ArrowUpDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SignalsTableProps {
  signals: Signal[];
  onRefreshPrices?: (signalsToUpdate: Signal[]) => Promise<void>;
  onDeleteSignal?: (id: number) => Promise<void>;
  onArchiveSignal?: (id: number) => Promise<void>;
}

export function SignalsTable({ 
  signals, 
  onRefreshPrices,
  onDeleteSignal,
  onArchiveSignal
}: SignalsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const columns: ColumnDef<Signal>[] = [
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">{row.getValue("coinPair")}</div>
          {!row.original.isActive && (
            <Badge variant="secondary" className="text-xs">Archived</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "entryRange",
      header: "Entry",
      cell: ({ row }) => (
        <div className="font-mono">
          {formatPrice(row.original.entryLow)} - {formatPrice(row.original.entryHigh)}
        </div>
      ),
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
      cell: ({ row }) => {
        const current = row.getValue("currentPrice") as number;
        const entryLow = row.original.entryLow;
        const entryHigh = row.original.entryHigh;
        const isInRange = current >= entryLow && current <= entryHigh;
        const changeFromEntry = ((current - entryLow) / entryLow) * 100;
        const lastUpdate = row.original.lastPriceUpdate;

        return (
          <div className="font-mono space-y-1">
            <div className="flex items-center gap-2">
              <div>{formatPrice(current)}</div>
              {lastUpdate && (
                <div className="text-xs text-muted-foreground">
                  ({formatDistance(lastUpdate, Date.now(), { addSuffix: true })})
                </div>
              )}
            </div>
            <div
              className={cn(
                "text-xs",
                changeFromEntry > 0
                  ? "text-green-500"
                  : changeFromEntry < 0
                  ? "text-red-500"
                  : "text-muted-foreground"
              )}
            >
              {changeFromEntry > 0 ? "+" : ""}
              {changeFromEntry.toFixed(2)}%
            </div>
            {isInRange && (
              <Badge variant="outline" className="text-xs">
                In Range
              </Badge>
            )}
          </div>
        );
      },
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
  ];

  const table = useReactTable({
    data: signals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleRefresh = async () => {
    if (!onRefreshPrices || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshPrices(signals);
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter pairs..."
            value={(table.getColumn("coinPair")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("coinPair")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        {onRefreshPrices && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isRefreshing && "animate-spin"
            )} />
            Refresh Prices
          </Button>
        )}
      </div>

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