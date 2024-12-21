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

  const handleToggleActive = async () => {
    try {
      await updateSignal(signal.id, { isActive: !signal.isActive });
    } catch (error) {
      console.error('Failed to update signal:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleActive}
      >
        <XCircle className={`h-4 w-4 ${signal.isActive ? 'text-muted-foreground' : 'text-red-500'}`} />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => router.push(`/signals/${signal.id}/edit`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      
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
