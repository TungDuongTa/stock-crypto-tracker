import { create } from "zustand";

interface CryptoWatchlistState {
  coinIds: string[];
  setCoinIds: (coinIds: string[]) => void;
  addCoinId: (coinId: string) => void;
  removeCoinId: (coinId: string) => void;
}

export const useCryptoWatchlistStore = create<CryptoWatchlistState>((set) => ({
  coinIds: [],
  setCoinIds: (coinIds) => set({ coinIds }),
  addCoinId: (coinId) =>
    set((state) => ({
      coinIds: state.coinIds.includes(coinId)
        ? state.coinIds
        : [...state.coinIds, coinId],
    })),
  removeCoinId: (coinId) =>
    set((state) => ({
      coinIds: state.coinIds.filter((id) => id !== coinId),
    })),
}));
