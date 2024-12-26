"use client";

import { Signal } from "@/types/signals";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, ExternalLink, Copy, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";

interface ActionCellProps {
  signal: Signal;
  onDeleteSignal?: (id: number) => Promise<void>;
  onArchiveSignal?: (id: number) => Promise<void>;
}

export function ActionCell({ signal, onDeleteSignal, onArchiveSignal }: ActionCellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/signals/${signal.id}`} passHref>
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
}
