import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!

const pool = new postgres.Pool(databaseUrl, 3, true)

Deno.serve(async (req) => {
  try {
    // Grab a connection from the pool
    const connection = await pool.connect()

    try {
      // Get all count prices from: https://api.binance.com/api/v3/ticker/price
      const res = await fetch('https://api.binance.com/api/v3/ticker/price')
      const prices: { symbol: string, price: string }[] = await res.json()


      return new Response('OK')
    } finally {
      connection.release()
    }
  } catch (err) {
    console.error(err)

    return new Response('Internal Server Error', { status: 500 })
  }
})
