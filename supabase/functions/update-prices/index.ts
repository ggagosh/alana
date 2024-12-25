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
      const result = await connection.queryObject`SELECT coin_pair FROM signals`
      const coinPairs = result.rows as { coin_pair: string }[];


      // Get the current prices
      const res = await fetch('https://api.binance.com/api/v3/ticker/price');
      const prices: { symbol: string, price: string }[] = await res.json();

      // Get the current prices for the coin pairs
      const currentPrices = coinPairs.map(coinPair => {
        const price = prices.find(price => price.symbol === coinPair.coin_pair);

        return {
          coinPair: coinPair.coin_pair,
          currentPrice: price ? parseFloat(price.price) : 0
        }
      });


      // Insert the current prices into the database
      const values = currentPrices.flatMap(price => [price.coinPair, price.currentPrice]);
      const placeholders = currentPrices.map((_, i) => `($${i * 2 + 1}, now(), $${i * 2 + 2})`).join(',');
      await connection.queryArray(`
          INSERT INTO coin_price_history (coin_pair, date, price) 
          VALUES ${placeholders}
        `, values);


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