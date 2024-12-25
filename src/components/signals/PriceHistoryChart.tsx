import { coinPriceHistory } from "@/db/schema";
import { db } from "@/db/drizzle";
import { eq, desc, and, gte } from "drizzle-orm";
import { type Signal } from "@/types/signals";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientChart } from "./ClientChart";

interface PriceHistoryChartProps {
  signal: Signal;
}

async function getPriceHistory(coinPair: string, startDate: Date) {
  try {
    const history = await db.query.coinPriceHistory.findMany({
      where: and(
        eq(coinPriceHistory.coinPair, coinPair),
        gte(coinPriceHistory.date, startDate)
      ),
      orderBy: [desc(coinPriceHistory.date)],
    });
    return history;
  } catch (error) {
    console.error("Error fetching price history:", error);
    return [];
  }
}

export async function PriceHistoryChart({ signal }: PriceHistoryChartProps) {
  const startDate = new Date(signal.dateAdded);
  const priceHistory = await getPriceHistory(signal.coinPair, startDate);

  const chartData = priceHistory.map((record) => ({
    date: format(new Date(record.date), "MMM dd HH:mm"),
    price: record.price,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientChart data={chartData} />
      </CardContent>
    </Card>
  );
}
