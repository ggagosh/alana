import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { signals } from "@/db/schema";
import { SignalDetails } from "@/components/signals/SignalDetails";
import { TakeProfitsProgress } from "@/components/signals/TakeProfitsProgress";
import { SignalActions } from "@/components/signals/SignalActions";

interface SignalPageProps {
  params: {
    id: string;
  };
}

export default async function SignalPage({ params }: SignalPageProps) {
  const signalId = parseInt(params.id);
  if (isNaN(signalId)) notFound();

  const signal = await db.query.signals.findFirst({
    where: eq(signals.id, signalId),
    with: {
      takeProfits: true,
    },
  });

  if (!signal) notFound();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{signal.coinPair} Signal</h1>
        <SignalActions signal={signal} />
      </div>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-6">
          <SignalDetails signal={signal} />
          <TakeProfitsProgress signal={signal} />
        </div>
      </div>
    </div>
  );
}
