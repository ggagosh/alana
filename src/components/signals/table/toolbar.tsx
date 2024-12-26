"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SignalsTableToolbarProps<TData> {
  table: Table<TData>;
  coins: string[];
}

export function SignalsTableToolbar<TData>({
  table,
  coins,
}: SignalsTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search signals..."
            value={(table.getColumn("coinPair")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("coinPair")?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
