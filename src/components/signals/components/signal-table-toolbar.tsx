"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignalTableFacetedFilter } from "./signal-table-faceted-filter";

interface SignalTableToolbarProps {
  searchFilter: string;
  onSearchChange: (value: string) => void;
  signalStatusFilter: string[];
  onSignalStatusChange: (value: string[]) => void;
  tpStatusFilter: string[];
  onTpStatusChange: (value: string[]) => void;
  hideClosedFilter: boolean;
  onHideClosedChange: (value: boolean) => void;
  onResetFilters: () => void;
}

export function SignalTableToolbar({
  searchFilter,
  onSearchChange,
  signalStatusFilter,
  onSignalStatusChange,
  tpStatusFilter,
  onTpStatusChange,
  hideClosedFilter,
  onHideClosedChange,
  onResetFilters,
}: SignalTableToolbarProps) {
  const isFiltered = searchFilter || signalStatusFilter.length > 0 || tpStatusFilter.length > 0;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search pairs..."
            value={searchFilter}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <SignalTableFacetedFilter
            value={signalStatusFilter}
            onChange={onSignalStatusChange}
            title="Signal Status"
            options={[
              { label: "Pre Entry", value: "pre_entry" },
              { label: "In Entry", value: "in_entry" },
              { label: "Active", value: "active" },
            ]}
          />
          <SignalTableFacetedFilter
            value={tpStatusFilter}
            onChange={onTpStatusChange}
            title="TP Status"
            options={[
              { label: "In Range", value: "in_range" },
              { label: "Above All TPs", value: "above_all_tp" },
              { label: "Below All TPs", value: "below_all_tp" },
              { label: "Near Stop Loss", value: "near_stop" },
              { label: "Below Stop Loss", value: "below_stop_loss" },
            ]}
          />
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={onResetFilters}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={hideClosedFilter ? "secondary" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => onHideClosedChange(!hideClosedFilter)}
          >
            {hideClosedFilter ? "Show Closed" : "Hide Closed"}
          </Button>
        </div>
      </div>
    </div>
  );
}