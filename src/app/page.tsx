import { db } from "@/db/drizzle";
import { signals, takeProfits } from "@/db/schema";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { QuickAddForm } from "@/components/signals/QuickAddForm";
import { RefreshPricesButton } from "@/components/signals/RefreshPricesButton";
import { StatsCard } from "@/components/signals/StatsCard";
import { addSignal, refreshPrices } from "./actions";

export default async function Home() {
  const signalsData = await db.query.signals.findMany({
    with: {
      takeProfits: true,
    },
    orderBy: (signals, { desc }) => [desc(signals.dateAdded)],
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <StatsCard signals={signalsData} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trading Signals</h1>
        <RefreshPricesButton
          signals={signalsData}
          onRefresh={refreshPrices}
        />
      </div>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        <SignalsTable signals={signalsData} />
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Add</h2>
          <QuickAddForm onSubmit={addSignal} />
        </div>
      </div>
    </div>
  );
}
