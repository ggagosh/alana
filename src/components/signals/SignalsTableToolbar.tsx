"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

interface SignalsTableToolbarProps<TData> {
  table: Table<TData>;
  coins: string[];
}

export function SignalsTableToolbar<TData>({
  table,
  coins,
}: SignalsTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter pairs..."
          value={(table.getColumn("coinPair")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("coinPair")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("signal_status_filter") && (
          <DataTableFacetedFilter
            column={table.getColumn("signal_status_filter")}
            title="Signal Status"
            options={[
              { label: "Pre Entry", value: "pre_entry" },
              { label: "In Entry", value: "in_entry" },
              { label: "Active", value: "active" },
              { label: "Closed", value: "closed" },
            ]}
          />
        )}
        {table.getColumn("tp_status_filter") && (
          <DataTableFacetedFilter
            column={table.getColumn("tp_status_filter")}
            title="TP Status"
            options={[
              { label: "In Range", value: "in_range" },
              { label: "Above All TPs", value: "above_all_tp" },
              { label: "Below All TPs", value: "below_all_tp" },
              { label: "Near Stop Loss", value: "near_stop" },
            ]}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}