import { type Signal } from "@/types/signals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientChart } from "./client-chart";

interface PriceHistoryChartProps {
  signal: Signal;
}

export async function PriceHistoryChart({ signal }: PriceHistoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientChart symbol={signal.coinPair} />
      </CardContent>
    </Card>
  );
}
