'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Signal } from "@/types/signals";
import { SignalTableCell } from "./SignalTableCell";
import { SignalTableColumnHeader } from "./SignalTableHeader";
import { SignalTableRowActions } from "./SignalTableRowActions";

export const columns: ColumnDef<Signal>[] = [
    {
        accessorKey: "coinPair",
        header: ({ column }) => <SignalTableColumnHeader column={column} title="Pair" />,
        cell: ({ row }) => <SignalTableCell type="pair" row={row} />,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) {
                return true;
            }

            return row.getValue<string>(columnId).toLowerCase().includes(filterValue.toLowerCase());
        },
    },
    {
        accessorKey: "entryRange",
        header: ({ column }) => <SignalTableColumnHeader column={column} title="Entry" />,
        cell: ({ row }) => <SignalTableCell type="entryRange" row={row} />,
    },
    {
        accessorKey: "currentPrice",
        header: ({ column }) => <SignalTableColumnHeader column={column} title="Current" />,
        cell: ({ row }) => <SignalTableCell type="currentPrice" row={row} />,
    },
    {
        accessorKey: "takeProfits",
        header: ({ column }) => <SignalTableColumnHeader column={column} title="Take Profits" />,
        cell: ({ row }) => <SignalTableCell type="takeProfits" row={row} />,
    },
    {
        accessorKey: "stopLoss",
        header: ({ column }) => <SignalTableColumnHeader column={column} title="Stop Loss" />,
        cell: ({ row }) => <SignalTableCell type="stopLoss" row={row} />,
    },
    {
        accessorKey: "dateShared",
        header: ({ column }) => <SignalTableColumnHeader column={column} title="Age" />,
        cell: ({ row }) => <SignalTableCell type="dateShared" row={row} />,
        filterFn: (row, columnId, columnFilters) => {
            const filterValue = columnFilters.getFilterValue(columnId);
            if (!filterValue) return true;

            return row.getValue<Date>(columnId) >= filterValue;
        },
    },
    {
        id: "status",
        header: ({ column }) => <SignalTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <SignalTableCell type="status" row={row} />,
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
            const isBelowSL = current < sl;

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
                    case "below_stop_loss":
                        return isBelowSL;
                    default:
                        return false;
                }
            });
        }
    },
    {
        id: "hide_closed_filter",
        filterFn: (row, id, value) => {
            if (!value) return true;

            return getSignalStatus(row.original) !== "closed";
        }
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <SignalTableRowActions
                row={row}
            />
        ),
    },
];

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