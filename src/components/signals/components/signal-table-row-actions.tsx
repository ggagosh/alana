"use client";

import { Row } from "@tanstack/react-table";
import { Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Signal } from "@/types/signals";

interface SignalTableRowActionsProps {
  row: Row<Signal>;
}

export function SignalTableRowActions({
  row,
}: SignalTableRowActionsProps) {
  const signal = row.original;

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          // Handle view action
          console.log('View signal:', signal);
        }}
        className="h-8 w-8"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          // Handle delete action
          console.log('Delete signal:', signal);
        }}
        className="h-8 w-8 text-destructive hover:text-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}