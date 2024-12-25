import { parsedSignalSchema } from '@/lib/schema';
import { streamObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const systemPrompt = `You are a trading signal parser. Your task is to extract structured data from trading signals text.
The signal should contain:
- Coin pair (e.g., BTCUSDT)
- Entry range (low and high)
- Current price
- Stop loss level
- Take profit levels (multiple levels possible)
- Date shared

Output should be in this exact JSON format:
{
  "parsed": {
    "coinPair": string,
    "entryLow": number,
    "entryHigh": number,
    "currentPrice": number,
    "stopLoss": number,
    "dateShared": number (timestamp),
    "takeProfits": [
      {
        "level": number,
        "price": number,
        "hit": false,
        "hitDate": null
      }
    ]
  }
}

Rules:
1. All prices should be numbers, not strings
2. Convert all dates to timestamps
3. Extract all take profit levels with their prices
4. If a single entry price is given, use it for both low and high
5. Current price should be within or close to the entry range
6. Ensure all required fields are present

If you can't parse the signal or any required data is missing, respond with an error message explaining what's missing.`;

  try {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    const result = streamObject({
      model: anthropic("claude-3-5-sonnet-20241022"),
      schema: parsedSignalSchema,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ]
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to parse signal' }),
      { status: 500 }
    );
  }
}
