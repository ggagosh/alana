"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Signal } from "@/types/signals";
import { filterFunctions } from "./signal-table-columns";
import { SignalTableToolbar } from "./signal-table-toolbar";
import { useEffect, useState } from "react";
import { useCoinStore } from "@/stores/coin-store";

interface SignalTableProps {
    data: Signal[] | undefined;
    columns: ColumnDef<Signal>[];
}

export function SignalTable({ data = [], columns }: SignalTableProps) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    // Filter states
    const [signalStatusFilter, setSignalStatusFilter] = React.useState<string[]>([]);
    const [tpStatusFilter, setTpStatusFilter] = React.useState<string[]>([]);
    const [hideClosedFilter, setHideClosedFilter] = React.useState(true);
    const [searchFilter, setSearchFilter] = React.useState("");
    const [signals, setSignals] = useState<Signal[]>(data);
    
    // Initialize coins
    useEffect(() => {
        const uniqueCoins = [...new Set(data.map(signal => signal.coinPair))];
        const { initializeCoin } = useCoinStore.getState();
        
        // Initialize all coins
        uniqueCoins.forEach(coin => {
            initializeCoin(coin);
        });
    }, [data]);
    
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

    // Apply all filters to the data
    const filteredData = React.useMemo(() => {
        if (!data) return [];

        return data.filter(signal =>
            filterFunctions.signalStatus(signal, signalStatusFilter) &&
            filterFunctions.tpStatus(signal, tpStatusFilter) &&
            filterFunctions.hideClosed(signal, hideClosedFilter) &&
            filterFunctions.searchText(signal, searchFilter)
        );
    }, [data, signalStatusFilter, tpStatusFilter, hideClosedFilter, searchFilter]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    const resetFilters = React.useCallback(() => {
        setSignalStatusFilter([]);
        setTpStatusFilter([]);
        setHideClosedFilter(true);
        setSearchFilter("");
    }, []);

    return (
        <div className="space-y-4">
            <SignalTableToolbar
                searchFilter={searchFilter}
                onSearchChange={setSearchFilter}
                signalStatusFilter={signalStatusFilter}
                onSignalStatusChange={setSignalStatusFilter}
                tpStatusFilter={tpStatusFilter}
                onTpStatusChange={setTpStatusFilter}
                hideClosedFilter={hideClosedFilter}
                onHideClosedChange={setHideClosedFilter}
                onResetFilters={resetFilters}
            />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const size = header.column.getSize();
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: `${size}px`, minWidth: `${size}px` }}
                                            className="whitespace-nowrap p-2"
                                        >
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
                                    {row.getVisibleCells().map((cell) => {
                                        const size = cell.column.getSize();
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                style={{ width: `${size}px`, minWidth: `${size}px` }}
                                                className="whitespace-nowrap p-2"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        );
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
    );
}