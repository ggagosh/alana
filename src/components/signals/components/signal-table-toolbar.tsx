"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { SignalTableFacetedFilter } from "./signal-table-faceted-filter";

interface SignalsTableToolbarProps<TData> {
  table: Table<TData>;
}

export function SignalTableToolbar<TData>({
  table,
}: SignalsTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Set default value for hide closed filter
  useEffect(() => {
    table.getColumn("hide_closed_filter")?.setFilterValue(true);
  }, [table]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Filter pairs..."
          value={(table.getColumn("coinPair")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("coinPair")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex items-center space-x-2">
          <Switch
            id="hide-closed"
            checked={table.getColumn("hide_closed_filter")?.getFilterValue() as boolean ?? true}
            onCheckedChange={(checked) => {
              table.getColumn("hide_closed_filter")?.setFilterValue(checked);
            }}
          />
          <Label htmlFor="hide-closed">Hide Closed</Label>
        </div>
        {table.getColumn("signal_status_filter") && (
          <SignalTableFacetedFilter
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
            <SignalTableFacetedFilter
            column={table.getColumn("tp_status_filter")}
            title="TP Status"
            options={[
                { label: "In Range", value: "in_range" },
                { label: "Above All TPs", value: "above_all_tp" },
                { label: "Below All TPs", value: "below_all_tp" },
                { label: "Near Stop Loss", value: "near_stop" },
                { label: "Below Stop Loss", value: "below_stop_loss" },
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