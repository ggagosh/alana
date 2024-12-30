"use client";

import { Row } from "@tanstack/react-table";
import { Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Signal } from "@/types/signals";
import { useRouter } from "next/navigation";

interface SignalTableRowActionsProps {
    row: Row<Signal>;
}

export function SignalTableRowActions({
    row,
}: SignalTableRowActionsProps) {
    const signal = row.original;
    const router = useRouter();

    const handleView = () => {
        router.push(`/signals/${signal.id}`);
    };

    const handleDelete = () => {
        // Handle delete action
        console.log('Delete signal:', signal);
    };

    return (
        <div className="flex items-center justify-end">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleView}
                className="h-7 w-7"
            >
                <Eye className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-7 w-7 text-destructive hover:text-destructive"
            >
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    );
}