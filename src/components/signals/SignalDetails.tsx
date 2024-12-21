import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signal } from "@/types/signals";
import { formatPrice, calculatePriceChange } from "@/lib/utils";

interface SignalDetailsProps {
  signal: Signal;
}

export function SignalDetails({ signal }: SignalDetailsProps) {
  const entryPrice = (signal.entryLow + signal.entryHigh) / 2;
  const priceChange = calculatePriceChange(signal.currentPrice, entryPrice);
  const isLong = signal.entryLow < signal.entryHigh;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signal Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Direction</p>
            <p className="text-lg font-semibold">{isLong ? 'Long' : 'Short'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Price</p>
            <p className="text-lg font-semibold flex items-center gap-2">
              {formatPrice(signal.currentPrice, signal.coinPair)}
              <span className={`text-sm ${priceChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Entry Range</p>
            <p className="text-lg font-semibold">
              {formatPrice(signal.entryLow, signal.coinPair)} - {formatPrice(signal.entryHigh, signal.coinPair)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stop Loss</p>
            <p className="text-lg font-semibold">{formatPrice(signal.stopLoss, signal.coinPair)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Signal Age</p>
          <p className="text-lg font-semibold">
            {new Date(signal.dateShared).toLocaleDateString()} 
            ({Math.floor((Date.now() - signal.dateShared) / (1000 * 60 * 60 * 24))} days)
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
          <p className="text-lg font-semibold">
            {signal.lastPriceUpdate 
              ? new Date(signal.lastPriceUpdate).toLocaleString()
              : 'Never'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
