"use client";

import { Signal } from "@/types/signals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, RefreshCw, Trash2 } from "lucide-react";
import { deleteSignal, updateSignal } from "@/app/actions";
import { useRouter } from "next/navigation";

interface SignalsTableProps {
  signals: Signal[];
}

export function SignalsTable({ signals }: SignalsTableProps) {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this signal?")) return;
    await deleteSignal(id);
    router.refresh();
  };

  const handleToggleActive = async (signal: Signal) => {
    await updateSignal(signal.id, { isActive: !signal.isActive });
    router.refresh();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pair</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Current</TableHead>
            <TableHead>Stop Loss</TableHead>
            <TableHead>Take Profits</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((signal) => {
            const firstTP = signal.takeProfits?.[0];
            const lastTP = signal.takeProfits?.[signal.takeProfits.length - 1];
            
            return (
              <TableRow key={signal.id} className={!signal.isActive ? "opacity-50" : undefined}>
                <TableCell className="font-medium">{signal.coinPair}</TableCell>
                <TableCell className="font-mono">
                  {signal.entryLow} - {signal.entryHigh}
                </TableCell>
                <TableCell className="font-mono">{signal.currentPrice}</TableCell>
                <TableCell className="font-mono">{signal.stopLoss}</TableCell>
                <TableCell className="font-mono">
                  {firstTP?.price} → {lastTP?.price}
                  <div className="text-xs text-muted-foreground">
                    {signal.takeProfits?.length} levels
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistance(signal.dateAdded, Date.now())} ago
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/signals/${signal.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(signal)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {signal.isActive ? "Mark as Inactive" : "Mark as Active"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(signal.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Signal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
