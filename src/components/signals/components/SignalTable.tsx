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
import { useState } from "react";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { SignalTableToolbar } from "./SignalTableToolbar";

interface SignalsTableProps {
    signals: Signal[];
    onDeleteSignal?: (id: number) => Promise<void>;
    onArchiveSignal?: (id: number) => Promise<void>;
    columns: ColumnDef<Signal>[];
}


export function SignalTable({
    signals,
    onDeleteSignal,
    onArchiveSignal,
    columns,
}: SignalsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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
    });

    return (
        <div className="space-y-4">
            <SignalTableToolbar table={table} coins={[]} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
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