import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { eq, and } from "drizzle-orm";
import { signals } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getUserOrThrow } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SignalActions } from "@/components/signals/signal-actions";
import { SignalDetails } from "@/components/signals/signal-details";
import { PriceHistoryChart } from "@/components/signals/price-history-chart";
import { PriceMovementWrapper } from "@/components/signals/price-movement-wrapper";

interface SignalPageProps {
  params: Promise<{
    id: string;
  }>
}

export default async function SignalPage({ params }: SignalPageProps) {
  const user = await getUserOrThrow();
  if (!user?.user) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const signalId = parseInt(id);
  if (isNaN(signalId)) notFound();

  const signal = await db.query.signals.findFirst({
    where: and(
      eq(signals.id, signalId),
      eq(signals.userId, user.user.id)
    ),
    with: {
      takeProfits: true,
    },
  });

  if (!signal) notFound();

  return (
    <div className="container mx-auto py-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{signal.coinPair} Signal</h1>
        </div>
        <SignalActions signal={signal} />
      </div>

      <div className="grid lg:grid-cols-[1.2fr_300px] gap-3">
        <div className="space-y-3">
          <div className="flex flex-col gap-4">
            <SignalDetails signal={signal} />
            <PriceHistoryChart signal={signal} />
          </div>
        </div>
        <div className="top-4 h-fit">
          <PriceMovementWrapper signal={signal} />
        </div>
      </div>
    </div>
  );
}
