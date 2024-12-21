'use server';

import { db } from "@/db/drizzle";
import { signals, takeProfits, apiKeys } from "@/db/schema";
import { ParsedSignalInput, Signal } from "@/types/signals";
import { getCurrentPrice, handleRateLimit } from "@/lib/binance";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";

export async function addSignal(data: ParsedSignalInput | ParsedSignalInput[]) {
  try {
    const signalsToAdd = Array.isArray(data) ? data : [data];
    const addedSignals = [];

    for (const signalData of signalsToAdd) {
      await handleRateLimit(); // Rate limit our Binance API calls
      const currentPrice = await getCurrentPrice(signalData.coinPair);
      
      const [signal] = await db.insert(signals).values({
        ...signalData.parsed,
        currentPrice,
        dateAdded: Date.now(),
        lastPriceUpdate: Date.now(),
        isActive: true,
      }).returning();

      // Insert take profits without id field
      if (signalData.parsed.takeProfits.length > 0) {
        await db.insert(takeProfits).values(
          signalData.parsed.takeProfits.map(tp => ({
            signalId: signal.id,
            level: tp.level,
            price: tp.price,
            hit: false,
            hitDate: null
          }))
        );
      }

      addedSignals.push(signal);
    }

    return addedSignals;
  } catch (error) {
    console.error('Failed to add signals:', error);
    throw error;
  }
}

export async function updateSignal(id: number, data: Partial<Signal>) {
  try {
    const [updated] = await db.update(signals)
      .set(data)
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
      
      await db.update(signals)
        .set({ 
          currentPrice,
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
