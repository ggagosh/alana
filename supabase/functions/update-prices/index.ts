import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true)

Deno.serve(async (_req) => {
  try {
    // Grab a connection from the pool
    const connection = await pool.connect()

    try {
      // Run a query
      const result = await connection.queryObject`SELECT id, coin_pair FROM signals`
      const coinPairs = result.rows as { coin_pair: string, id: number }[];


      // Get the current prices
      const res = await fetch('https://api.binance.com/api/v3/ticker/price');
      const prices: { symbol: string, price: string }[] = await res.json();

      // Get the current prices for the coin pairs
      const currentPrices = coinPairs.map(coinPair => {
        const price = prices.find(price => price.symbol === coinPair.coin_pair);

        return {
          id: coinPair.id,
          coinPair: coinPair.coin_pair,
          currentPrice: price ? parseFloat(price.price) : 0
        }
      });

      // Update the current prices and last_price_update in the database
      const placeholders2 = currentPrices.map((_, i) => `$${i + 1}`).join(',');
      const values2 = currentPrices.map(price => price.coinPair);

      await connection.queryArray(`
          UPDATE signals 
          SET current_price = CASE coin_pair 
              ${currentPrices.map((_, i) =>
        `WHEN $${i + 1} THEN $${currentPrices.length + i + 1}::real`
      ).join('\n        ')}
          END,
          last_price_update = now()
          WHERE coin_pair IN (${placeholders2})
      `, [...values2, ...currentPrices.map(price => price.currentPrice)]);


      // Now I want to update the take_profits table and set hit to true if the current price is greater than the take profit price
      // And hit_date to now()
      await connection.queryArray(`
        UPDATE take_profits
        SET 
            hit = true,
            hit_date = now()
        FROM signals
        WHERE 
            take_profits.signal_id = signals.id 
            AND take_profits.hit = false 
            AND signals.current_price >= take_profits.price
        `);

      // Return the response with the correct content type header
      return new Response('OK', { status: 200 })
    } finally {
      connection.release()
    }
  } catch (err) {
    console.error(err)

    return new Response('Internal Server Error', { status: 500 })
  }
})