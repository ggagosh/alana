'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Signal } from '@/types/signals';
import { RefreshCw } from 'lucide-react';

interface RefreshPricesButtonProps {
  signals: Signal[];
  onRefresh: (signals: Signal[]) => Promise<void>;
}

export function RefreshPricesButton({ signals, onRefresh }: RefreshPricesButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh(signals);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
    </Button>
  );
}
