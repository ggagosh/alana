'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseSignalText } from '@/lib/parser';
import { ParsedSignalInput } from '@/types/signals';
import { formatDistance } from 'date-fns';

interface QuickAddFormProps {
  onSubmit: (signals: ParsedSignalInput[]) => Promise<{
    id: number;
    dateAdded: number;
    lastPriceUpdate: number | null;
    isActive: boolean;
    coinPair: string;
    entryLow: number;
    entryHigh: number;
    currentPrice: number;
    stopLoss: number;
    dateShared: number;
  }[]>;
}

// Helper function to format numbers in a user-friendly way
function formatPrice(price: number): string {
  let priceStr = price.toString();
  if (priceStr.includes('e')) {
    const [base, exponent] = priceStr.split('e');
    const exp = parseInt(exponent);
    if (exp < 0) {
      const absExp = Math.abs(exp);
      priceStr = '0.' + '0'.repeat(absExp - 1) + base.replace('.', '');
    }
  }
  priceStr = priceStr.replace(/\.?0+$/, '');
  if (!priceStr.includes('.')) {
    priceStr += '.0';
  }
  return priceStr;
}

// Helper to calculate percentage difference
function calculatePercentage(current: number, target: number): number {
  return ((target - current) / current) * 100;
}

export function QuickAddForm({ onSubmit }: QuickAddFormProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [parsedSignals, setParsedSignals] = useState<ParsedSignalInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleTextChange = (value: string) => {
    setText(value);
    try {
      const parsed = parseSignalText(value);
      setParsedSignals(parsed);
      setParseError(null);
    } catch (error) {
      console.error('Parse error:', error);
      setParseError(error instanceof Error ? error.message : 'Failed to parse signals');
      setParsedSignals([]);
    }
  };

  const handleSubmit = async () => {
    if (!parsedSignals.length || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(parsedSignals);
      setText('');
      setParsedSignals([]);
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to add signals. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSubmit();
      }}
    >
      <Textarea
        placeholder={`Paste your signals here...\n\nExample format:\nGALABTC\n\nENTRY: 0.00000034 - 0.00000041\nCP: 0.00000039\n\nTP1: 0.00000049\nTP2: 0.00000064\n...\n\nSTOP: Close weekly below 0.00000030\n\nSHARED: 20-Dec-2024`}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        className="min-h-[200px] font-mono text-sm"
      />
      
      {parseError && (
        <div className="text-sm text-red-500">
          {parseError}
        </div>
      )}

      {parsedSignals.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-4">Preview ({parsedSignals.length} signal{parsedSignals.length !== 1 ? 's' : ''})</h3>
          <ul className="space-y-4">
            {parsedSignals.map((signal, index) => {
              const risk = calculatePercentage(signal.parsed.currentPrice, signal.parsed.stopLoss);
              
              return (
                <li key={index} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">{signal.coinPair}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistance(signal.parsed.dateShared, Date.now())} ago
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Entry Range</div>
                      <div className="font-mono">
                        {formatPrice(signal.parsed.entryLow)} -
                        <br />
                        {formatPrice(signal.parsed.entryHigh)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Current Price</div>
                      <div className="font-mono">{formatPrice(signal.parsed.currentPrice)}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-muted-foreground text-sm">Stop Loss</div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm">{formatPrice(signal.parsed.stopLoss)}</div>
                      <div className="text-red-500 text-sm">({Math.abs(risk).toFixed(1)}%)</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">Take Profits</div>
                    <div className="grid grid-cols-2 gap-4">
                      {signal.parsed.takeProfits.map((tp) => {
                        const profit = calculatePercentage(signal.parsed.currentPrice, tp.price);
                        return (
                          <div key={tp.level} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground text-sm">TP{tp.level}</span>
                              <span className="font-mono text-sm">{formatPrice(tp.price)}</span>
                            </div>
                            <span className="text-green-500 text-sm">{profit.toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Button 
        type="submit"
        disabled={!parsedSignals.length || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Adding Signals...' : `Add ${parsedSignals.length} Signal${parsedSignals.length !== 1 ? 's' : ''}`}
      </Button>

      <div className="text-xs text-muted-foreground">
        {text && !parsedSignals.length && 'No valid signals found. Please check the format.'}
      </div>
    </form>
  );
}
