'use server';

import { db } from "@/db/drizzle";
import { signals, takeProfits, apiKeys } from "@/db/schema";
import { Signal } from "@/types/signals";
import { getCurrentPrice, handleRateLimit } from "@/lib/binance";
import { eq, inArray, and } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";
import { formatPrice } from "@/lib/utils";
import { Signal as SignalSchema } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { getUserOrThrow } from "@/lib/auth/session";
import { redirect } from "next/navigation";

async function getUserIdOrRedirect() {
  const user = await getUserOrThrow();
  if (!user?.user) {
    redirect('/auth/login');
  }
  return user.user.id;
}

export async function addSignal(data: SignalSchema) {
  try {
    const userId = await getUserIdOrRedirect();
    const signalsToAdd: SignalSchema[] = Array.isArray(data) ? data : [data];
    const addedSignalIds = [];

    for (const signalData of signalsToAdd) {
      await handleRateLimit(); // Rate limit our Binance API calls
      const currentPrice = await getCurrentPrice(signalData.coinPair);

      const normalizedSignal = {
        ...signalData,
        userId,
        currentPrice: Number(formatPrice(currentPrice)),
        dateAdded: new Date(),
        lastPriceUpdate: new Date(),
        isActive: true,
      };

      const existingSignal = await db.query.signals.findFirst({
        where: and(
          eq(signals.coinPair, signalData.coinPair),
          eq(signals.userId, userId)
        )
      });
      if (existingSignal) {
        await db.delete(signals).where(eq(signals.id, existingSignal.id));
      }

      const [signal] = await db.insert(signals).values(normalizedSignal).returning();

      // Insert take profits without id field
      if (signalData.takeProfits.length > 0) {
        await db.insert(takeProfits).values(
          signalData.takeProfits.map(tp => ({
            signalId: signal.id,
            level: tp.level,
            price: Number(formatPrice(tp.price)),
            hit: false,
            hitDate: null
          }))
        );
      }

      addedSignalIds.push(signal.id);
    }

    return await db.query.signals.findMany({
      where: inArray(signals.id, addedSignalIds),
      with: {
        takeProfits: true,
      },
    });
  } catch (error) {
    console.error('Failed to add signals:', error);
    throw error;
  }
}

export async function updateSignal(id: number, data: Partial<Signal>) {
  try {
    const userId = await getUserIdOrRedirect();
    const normalizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (["entryLow", "entryHigh", "currentPrice", "stopLoss"].includes(key) && typeof value === "number") {
          return [key, Number(formatPrice(value))];
        }
        return [key, value];
      })
    );

    const [updated] = await db.update(signals)
      .set(normalizedData)
      .where(and(
        eq(signals.id, id),
        eq(signals.userId, userId)
      ))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update signal:', error);
    throw error;
  }
}

export async function deleteSignal(id: number) {
  try {
    const userId = await getUserIdOrRedirect();
    // Take profits will be cascade deleted
    await db.delete(signals).where(and(
      eq(signals.id, id),
      eq(signals.userId, userId)
    ));
  } catch (error) {
    console.error('Failed to delete signal:', error);
    throw error;
  }
}

export async function refreshPrices(signalsToUpdate: Signal[]) {
  try {
    const userId = await getUserIdOrRedirect();
    for (const signal of signalsToUpdate) {
      // Verify signal belongs to user
      const userSignal = await db.query.signals.findFirst({
        where: and(
          eq(signals.id, signal.id),
          eq(signals.userId, userId)
        )
      });

      if (!userSignal) continue;

      await handleRateLimit();
      const currentPrice = await getCurrentPrice(signal.coinPair);
      const newPrice = Number(formatPrice(currentPrice));

      await db.update(signals)
        .set({
          currentPrice: newPrice,
          lastPriceUpdate: new Date()
        })
        .where(eq(signals.id, signal.id));
    }
  } catch (error) {
    console.error('Failed to refresh prices:', error);
    throw error;
  }
}

export async function updateTakeProfit(id: number, hit: boolean) {
  try {
    const userId = await getUserIdOrRedirect();
    // Verify the take profit belongs to a signal owned by the user
    const takeProfit = await db.query.takeProfits.findFirst({
      where: eq(takeProfits.id, id),
      with: {
        signal: true
      }
    });

    if (!takeProfit || takeProfit.signal.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const [updated] = await db.update(takeProfits)
      .set({
        hit,
        hitDate: hit ? new Date() : null
      })
      .where(eq(takeProfits.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update take profit:', error);
    throw error;
  }
}

export async function saveApiKeys(name: string, key: string, secret: string) {
  try {
    const userId = await getUserIdOrRedirect();
    // Encrypt sensitive data
    const encryptedKey = await encrypt(key);
    const encryptedSecret = await encrypt(secret);

    // Delete existing key with same name if exists
    await db.delete(apiKeys).where(and(
      eq(apiKeys.name, name),
      eq(apiKeys.userId, userId)
    ));

    // Save new key
    await db.insert(apiKeys).values({
      userId,
      name,
      key: encryptedKey,
      secret: encryptedSecret,
      dateAdded: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save API keys:', error);
    throw new Error('Failed to save API keys');
  }
}

export async function getApiKeys(name: string) {
  try {
    const userId = await getUserIdOrRedirect();
    const keys = await db.select().from(apiKeys).where(and(
      eq(apiKeys.name, name),
      eq(apiKeys.userId, userId)
    ));
    if (!keys.length) return null;

    const key = keys[0];
    return {
      name: key.name,
      key: await decrypt(key.key),
      secret: await decrypt(key.secret),
      dateAdded: key.dateAdded,
      lastUsed: key.lastUsed,
    };
  } catch (error) {
    console.error('Failed to get API keys:', error);
    throw new Error('Failed to get API keys');
  }
}

export async function deleteApiKeys(name: string) {
  try {
    const userId = await getUserIdOrRedirect();
    await db.delete(apiKeys).where(and(
      eq(apiKeys.name, name),
      eq(apiKeys.userId, userId)
    ));
    return { success: true };
  } catch (error) {
    console.error('Failed to delete API keys:', error);
    throw new Error('Failed to delete API keys');
  }
}

export async function addSignalAndRevalidate(data: SignalSchema) {
  'use server';

  const result = await addSignal(data);
  revalidatePath('/');
  return result;
}
