import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../_shared/schema.ts'

const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!;

Deno.serve(async (_req) => {
  try {
    const client = postgres(databaseUrl, { prepare: false })
    const db = drizzle(client, { schema });

    // Get all coin pairs from signals table
    const signals = await db.query.signals.findMany();

    // Get all count prices from: https://api.binance.com/api/v3/ticker/price
    const res = await fetch('https://api.binance.com/api/v3/ticker/price');
    const prices: { symbol: string, price: string }[] = await res.json();

    // Filter out only the coin pairs we need
    const filteredPrices = prices.filter(price => signals.some(coinPair => coinPair.coinPair === price.symbol));

    // Insert prices into coin_price_history table
    await db.insert(schema.coinPriceHistory)
      .values(filteredPrices.map(price => ({ coinPair: price.symbol, price: Number(price.price), date: new Date() })))
      .onConflictDoNothing();


    return new Response('OK')
  } catch (err) {
    console.error(err)

    return new Response('Internal Server Error', { status: 500 })
  }
})
