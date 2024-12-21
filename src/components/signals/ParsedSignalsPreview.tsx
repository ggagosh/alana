import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParsedSignalInput } from "@/types/signals";
import { formatPrice } from "@/lib/utils";

interface ParsedSignalsPreviewProps {
  signals: ParsedSignalInput[];
}

export function ParsedSignalsPreview({ signals }: ParsedSignalsPreviewProps) {
  if (signals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview ({signals.length} signals)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {signals.map((signal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{signal.coinPair}</h3>
              <span className="text-sm text-muted-foreground">
                {signal.parsed.entryLow < signal.parsed.entryHigh ? 'Long' : 'Short'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Entry Range:</span>
                <p>
                  {formatPrice(signal.parsed.entryLow, signal.coinPair)} - 
                  {formatPrice(signal.parsed.entryHigh, signal.coinPair)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Stop Loss:</span>
                <p>{formatPrice(signal.parsed.stopLoss, signal.coinPair)}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Take Profits:</span>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {signal.parsed.takeProfits.map((tp, tpIndex) => (
                  <div key={tpIndex} className="text-sm">
                    <span className="text-muted-foreground">TP{tp.level}:</span>
                    <p>{formatPrice(tp.price, signal.coinPair)}</p>
                  </div>
                ))}
              </div>
            </div>

            {index < signals.length - 1 && (
              <div className="border-t border-border mt-4 pt-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
