import { ParsedSignalInput } from '@/types/signals';

export function parseSignalText(text: string): ParsedSignalInput[] {
  const signals: ParsedSignalInput[] = [];
  
  // Normalize line endings and split into blocks
  const normalizedText = text.replace(/\r\n/g, '\n');
  // Split by multiple line breaks or dashed lines
  const signalBlocks = normalizedText.split(/(?:\n\s*\n|[\s-]*-{3,}[\s-]*)/g)
    .filter(block => block.trim());

  for (const block of signalBlocks) {
    try {
      const lines = block.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length < 4) continue;

      // Get coin pair - first non-empty line
      const coinPair = lines[0].trim();
      
      // Parse current price (supports both CP: and CURRENT PRICE: formats)
      const cpLine = lines.find(l => /^(?:CP|CURRENT PRICE):/i.test(l));
      let currentPrice = 0;
      if (cpLine) {
        const cpMatch = cpLine.match(/:\s*([\d.]+)/i);
        currentPrice = cpMatch ? parseFloat(cpMatch[1]) : 0;
      }

      // Parse entry range (supports both formats)
      const entryLine = lines.find(l => l.toLowerCase().startsWith('entry:'));
      let entryLow = 0, entryHigh = 0;

      if (entryLine) {
        // Format: ENTRY: 0.00000034 - 0.00000041
        const entryMatch = entryLine.match(/ENTRY:\s*([\d.]+)\s*-\s*([\d.]+)/i);
        if (entryMatch) {
          [entryLow, entryHigh] = [parseFloat(entryMatch[1]), parseFloat(entryMatch[2])];
        }
      } else {
        // Format: Multiple entry points
        const entrySection = lines
          .map((line, index) => ({ line, nextLine: lines[index + 1] }))
          .find(({ line, nextLine }) => 
            line.toLowerCase() === 'entry:' && nextLine?.match(/^\d+\)/));

        if (entrySection) {
          const entryPoints = lines
            .filter(l => /^\d+\)\s*[\d.]+$/.test(l))
            .map(l => parseFloat(l.replace(/^\d+\)\s*/, '')))
            .filter(n => !isNaN(n));

          if (entryPoints.length > 0) {
            entryLow = Math.min(...entryPoints);
            entryHigh = Math.max(...entryPoints);
          }
        }
      }

      // If no current price was found but we have entry points, use the first entry
      if (!currentPrice && entryLow) {
        currentPrice = entryLow;
      }

      // Parse take profits (supports both formats)
      let takeProfits: Array<{ signalId: number; level: number; price: number; hit: boolean; hitDate: number | null }> = [];
      
      // Check for standard TP format
      const standardTPs = lines
        .filter(l => /^TP\d+:/i.test(l))
        .map(tp => {
          const [level, price] = tp.split(':').map(part => part.trim());
          return {
            signalId: -1, // Will be set when inserting
            level: parseInt(level.replace(/^TP/i, '')),
            price: parseFloat(price),
            hit: false,
            hitDate: null
          };
        });

      // Check for numbered targets format
      const targetsSection = lines
        .map((line, index) => ({ line, nextLine: lines[index + 1] }))
        .find(({ line, nextLine }) => 
          line.toLowerCase() === 'targets:' && nextLine?.match(/^\d+\)/));

      if (targetsSection) {
        const numberedTPs = lines
          .filter(l => /^\d+\)\s*[\d.]+$/.test(l))
          .map((tp, index) => ({
            signalId: -1,
            level: index + 1,
            price: parseFloat(tp.replace(/^\d+\)\s*/, '')),
            hit: false,
            hitDate: null
          }));

        takeProfits = numberedTPs;
      } else {
        takeProfits = standardTPs;
      }

      // Parse stop loss
      const stopLine = lines.find(l => l.toLowerCase().startsWith('stop:'));
      const stopMatch = stopLine?.match(/below\s*([\d.]+)/i);
      if (!stopMatch) continue;
      const stopLoss = parseFloat(stopMatch[1]);

      // Parse shared date
      const sharedLine = lines.find(l => l.toLowerCase().startsWith('shared:'));
      const sharedMatch = sharedLine?.match(/SHARED:\s*(\d{1,2}-[A-Za-z]{3}-\d{4})/i);
      const dateShared = sharedMatch 
        ? new Date(sharedMatch[1].trim()).getTime()
        : Date.now();

      if (!coinPair || !entryLow || !entryHigh || !stopLoss || takeProfits.length === 0) {
        continue;
      }

      signals.push({
        coinPair,
        text: block,
        parsed: {
          coinPair,
          entryLow,
          entryHigh,
          currentPrice,
          stopLoss,
          dateShared,
          takeProfits
        }
      });
    } catch (error) {
      console.error('Failed to parse signal block:', error);
      continue;
    }
  }

  return signals;
}
