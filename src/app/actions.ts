'use server';

import { db } from "@/db/drizzle";
import { signals, takeProfits, apiKeys } from "@/db/schema";
import { Signal } from "@/types/signals";
import { getCurrentPrice, handleRateLimit } from "@/lib/binance";
import { eq, inArray } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";
import { formatPrice } from "@/lib/utils";
import { Signal as SignalSchema } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export async function addSignal(data: SignalSchema) {
  try {
    const signalsToAdd: SignalSchema[] = Array.isArray(data) ? data : [data];
    const addedSignalIds = [];

    for (const signalData of signalsToAdd) {
      await handleRateLimit(); // Rate limit our Binance API calls
      const currentPrice = await getCurrentPrice(signalData.coinPair);

      const normalizedSignal = {
        ...signalData,
        currentPrice: Number(formatPrice(currentPrice)),
        dateAdded: Date.now(),
        lastPriceUpdate: Date.now(),
        isActive: true,
      };

      const existingSignal = await db.query.signals.findFirst({
        where: eq(signals.coinPair, signalData.coinPair)
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
      .where(eq(signals.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update signal:', error);
    throw error;
  }
}

export async function deleteSignal(id: number) {
  try {
    // Take profits will be cascade deleted
    await db.delete(signals).where(eq(signals.id, id));
  } catch (error) {
    console.error('Failed to delete signal:', error);
    throw error;
  }
}

export async function refreshPrices(signalsToUpdate: Signal[]) {
  try {
    for (const signal of signalsToUpdate) {
      await handleRateLimit();
      const currentPrice = await getCurrentPrice(signal.coinPair);

      const newPrice = Number(formatPrice(currentPrice));

      await db.update(signals)
        .set({
          currentPrice: newPrice,
          lastPriceUpdate: Date.now()
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
    const [updated] = await db.update(takeProfits)
      .set({
        hit,
        hitDate: hit ? Date.now() : null
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
    // Encrypt sensitive data
    const encryptedKey = await encrypt(key);
    const encryptedSecret = await encrypt(secret);

    // Delete existing key with same name if exists
    await db.delete(apiKeys).where(eq(apiKeys.name, name));

    // Save new key
    await db.insert(apiKeys).values({
      name,
      key: encryptedKey,
      secret: encryptedSecret,
      dateAdded: Date.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save API keys:', error);
    throw new Error('Failed to save API keys');
  }
}

export async function getApiKeys(name: string) {
  try {
    const keys = await db.select().from(apiKeys).where(eq(apiKeys.name, name));
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
    await db.delete(apiKeys).where(eq(apiKeys.name, name));
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
