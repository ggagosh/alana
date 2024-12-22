"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { useState } from "react";
import { QuickAddForm } from "./QuickAddForm";
import { ParsedSignalInput, Signal } from "@/types/signals";

interface QuickAddProps {
  onSubmit: (signals: ParsedSignalInput[]) => Promise<Signal[]>;
}

export function QuickAdd({ onSubmit }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (signals: ParsedSignalInput[]) => {
    const addedSignals = await onSubmit(signals);
    
    setIsOpen(false);

    return addedSignals;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Signal
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Add New Signal</SheetTitle>
          <SheetDescription>
            Add a new trading signal with entry points and take profit levels.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full pt-6">
          <div className="flex-1 overflow-y-auto">
            <QuickAddForm onSubmit={handleSubmit} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
