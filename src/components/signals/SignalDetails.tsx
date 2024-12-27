import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signal } from "@/types/signals";
import { calculatePriceChange } from "@/lib/utils";
import CryptoPrice from "./CryptoPrice";

interface SignalDetailsProps {
  signal: Signal;
}

export function SignalDetails({ signal }: SignalDetailsProps) {
  const entryPrice = (signal.entryLow + signal.entryHigh) / 2;
  const priceChange = calculatePriceChange(signal.currentPrice, entryPrice);
  const isLong = signal.entryLow < signal.entryHigh;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-base">Signal Details</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Direction</p>
            <p className="font-medium">{isLong ? 'Long' : 'Short'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Price</p>
            <p className="font-medium flex items-center gap-1">
              <CryptoPrice price={signal.currentPrice} />
              <span className={`text-xs ${priceChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange}
              </span>
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Entry Range</p>
            <p className="font-medium font-mono">
              <CryptoPrice price={signal.entryLow} />
              <span className="mx-1">-</span>
              <CryptoPrice price={signal.entryHigh} />
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Stop Loss</p>
            <p className="font-medium font-mono">
              <CryptoPrice price={signal.stopLoss} />
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Signal Age</p>
            <p className="font-medium">
              {new Date(signal.dateShared).toLocaleDateString()} 
              <span className="text-xs text-muted-foreground ml-1">
                ({Math.floor((Date.now() - signal.dateShared.getTime()) / (1000 * 60 * 60 * 24))}d)
              </span>
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">
              {signal.lastPriceUpdate 
                ? new Date(signal.lastPriceUpdate).toLocaleString()
                : 'Never'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
