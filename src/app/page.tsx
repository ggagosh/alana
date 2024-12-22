import { Suspense } from "react";
import { db } from "@/db/drizzle";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { QuickAdd } from "@/components/signals/QuickAdd";
import { StatsCards } from "@/components/signals/StatsCards";
import { addSignal, deleteSignal, refreshPrices, updateSignal } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

async function SignalsData() {
  const signalsData = await db.query.signals.findMany({
    with: {
      takeProfits: true,
    },
    orderBy: (signals, { desc }) => [desc(signals.dateShared)],
  });

  return (
    <>
      <div className="container">
        <StatsCards signals={signalsData} />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trading Signals</h1>
            <p className="text-muted-foreground">
              Manage and track your trading signals
            </p>
          </div>
          <QuickAdd onSubmit={addSignal} />
        </div>

        <SignalsTable 
          signals={signalsData}
          onRefreshPrices={refreshPrices}
          onDeleteSignal={deleteSignal}
        />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="space-y-8 py-8">
      <Suspense 
        fallback={
          <div className="container">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        }
      >
        <SignalsData />
      </Suspense>
    </div>
  );
}
