import { Suspense } from "react";
import { db } from "@/db/drizzle";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { QuickAdd } from "@/components/signals/QuickAdd";
import { deleteSignal, addSignalAndRevalidate } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserOrThrow } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { signals } from "@/db/schema";

async function SignalsData() {
  const user = await getUserOrThrow();
  if (!user?.user) {
    redirect('/auth/login');
  }

  const signalsData = await db.query.signals.findMany({
    where: eq(signals.userId, user.user.id),
    with: {
      takeProfits: true,
    },
    orderBy: (signals, { desc }) => [desc(signals.dateAdded)],
  });

  return (
    <>
      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trading Signals</h1>
            <p className="text-muted-foreground">
              Manage and track your trading signals
            </p>
          </div>
          <QuickAdd onSubmit={addSignalAndRevalidate} />
        </div>

        <SignalsTable
          signals={signalsData}
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
