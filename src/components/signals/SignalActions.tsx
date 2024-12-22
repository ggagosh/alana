'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Signal } from "@/types/signals";
import { deleteSignal, updateSignal } from "@/app/actions";
import { Pencil, Trash2, XCircle } from "lucide-react";

interface SignalActionsProps {
  signal: Signal;
}

export function SignalActions({ signal }: SignalActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this signal?')) return;

    setIsDeleting(true);
    try {
      await deleteSignal(signal.id);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete signal:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}
