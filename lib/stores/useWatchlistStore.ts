import { create } from "zustand";

interface WatchlistState {
  symbols: string[]; // Source of truth: array of symbols (e.g., ["AAPL", "TSLA"])
  setSymbols: (symbols: string[]) => void;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>((set) => ({
  symbols: [],
  setSymbols: (symbols) => set({ symbols }),
  addSymbol: (symbol) =>
    set((state) => ({
      symbols: state.symbols.includes(symbol.toUpperCase())
        ? state.symbols
        : [...state.symbols, symbol.toUpperCase()],
    })),
  removeSymbol: (symbol) =>
    set((state) => ({
      symbols: state.symbols.filter((s) => s !== symbol.toUpperCase()),
    })),
}));
