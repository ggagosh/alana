import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PriceState {
  prices: Record<string, number>;
  previousPrices: Record<string, number>;
  updatePrice: (symbol: string, price: number) => void;
  getPriceBySymbol: (symbol: string) => number | null;
  getPreviousPriceBySymbol: (symbol: string) => number | null;
}

export const usePriceStore = create<PriceState>()(
  devtools(
    (set, get) => ({
      prices: {},
      previousPrices: {},
      updatePrice: (symbol: string, price: number) => 
        set(
          (state) => ({
            prices: {
              ...state.prices,
              [symbol]: price
            },
            previousPrices: {
              ...state.previousPrices,
              [symbol]: state.prices[symbol]
            }

          }),
          false,
          'prices/update'
        ),
      getPriceBySymbol: (symbol: string) => get().prices[symbol] ?? null,
      getPreviousPriceBySymbol: (symbol: string) => get().previousPrices[symbol] ?? null
    }),
    {
      name: 'price-store',
    }
  )
);
