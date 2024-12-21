const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

export async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    const formattedSymbol = formatSymbol(symbol);
    const response = await fetch(`${BINANCE_API_BASE}/ticker/price?symbol=${formattedSymbol}`);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Number(data.price);
  } catch (error) {
    console.error('Failed to fetch price:', error);
    throw error;
  }
}

export function formatSymbol(pair: string): string {
  // Remove any special characters and spaces
  return pair.replace(/[^A-Z]/g, '');
}

// Simple rate limiting
let lastCallTime = 0;
const RATE_LIMIT_MS = 100; // 10 requests per second max

export async function handleRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < RATE_LIMIT_MS) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastCall)
    );
  }
  
  lastCallTime = Date.now();
}
