"use client";

import { Signal } from "@/types/signals";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    ColumnFiltersState,
    getFilteredRowModel,
    ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { SignalTableToolbar } from "./signal-table-toolbar";
import { useCoinStore } from "@/stores/coin-store";

interface SignalsTableProps {
    signals: Signal[];
    columns: ColumnDef<Signal>[];
}

export function SignalTable({
    signals: initialSignals,
    columns,
}: SignalsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [signals, setSignals] = useState<Signal[]>(initialSignals);

    // Initialize coins
    useEffect(() => {
        const uniqueCoins = [...new Set(initialSignals.map(signal => signal.coinPair))];
        const { initializeCoin } = useCoinStore.getState();

        // Initialize all coins
        uniqueCoins.forEach(coin => {
            initializeCoin(coin);
        });
    }, [initialSignals]);

    // Subscribe to coin store updates
    useEffect(() => {
        const unsubscribe = useCoinStore.subscribe(
            (state) => {
                setSignals(prevSignals =>
                    prevSignals.map(signal => {
                        const coinData = state.coins[signal.coinPair];
                        if (!coinData?.currentPrice) return signal;
                        if (coinData.currentPrice === signal.currentPrice) return signal;

                        return {
                            ...signal,
                            currentPrice: coinData.currentPrice,
                            lastPriceUpdate: new Date(),
                            takeProfits: signal.takeProfits.map(tp => ({
                                ...tp,
                                hit: tp.hit || coinData.currentPrice >= tp.price,
                                hitDate: tp.hit ? tp.hitDate :
                                    (coinData.currentPrice >= tp.price ? new Date() : null)
                            })),
                            isActive: coinData.currentPrice <= signal.stopLoss ? false : signal.isActive
                        };
                    })
                );
            }
        );

        return () => {
            unsubscribe();
        };
    }, [signals]);

    const table = useReactTable({
        data: signals,
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
        defaultColumn: {
            size: 100,
            minSize: 100,
            maxSize: 100,
        },
    });

    return (
        <div className="space-y-4">
            <SignalTableToolbar table={table} />
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const size = header.column.getSize();
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{ width: `${size}px`, minWidth: `${size}px` }}
                                            className="whitespace-nowrap"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
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
                                    {row.getVisibleCells().map((cell) => {
                                        const size = cell.column.getSize();
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                style={{ width: `${size}px`, minWidth: `${size}px` }}
                                                className="whitespace-nowrap"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}