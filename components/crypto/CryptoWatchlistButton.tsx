"use client";

import React, { useMemo } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  addToCryptoWatchlist,
  removeFromCryptoWatchlist,
} from "@/lib/actions/crypto-watchlist.actions";
import { useCryptoWatchlistStore } from "@/lib/stores/useCryptoWatchlistStore";

type CryptoWatchlistButtonProps = {
  coinId: string;
  symbol: string;
  name: string;
  image?: string;
  showTrashIcon?: boolean;
  type?: "button" | "icon";
};

export default function CryptoWatchlistButton({
  coinId,
  symbol,
  name,
  image,
  showTrashIcon = false,
  type = "button",
}: CryptoWatchlistButtonProps) {
  const coinIds = useCryptoWatchlistStore((state) => state.coinIds);
  const addCoinId = useCryptoWatchlistStore((state) => state.addCoinId);
  const removeCoinId = useCryptoWatchlistStore((state) => state.removeCoinId);

  const isAdded = useMemo(() => coinIds.includes(coinId), [coinIds, coinId]);

  const toggleWatchlist = async () => {
    const originalStatus = isAdded;

    if (originalStatus) {
      removeCoinId(coinId);
    } else {
      addCoinId(coinId);
    }

    try {
      const result = originalStatus
        ? await removeFromCryptoWatchlist(coinId)
        : await addToCryptoWatchlist({
            coinId,
            symbol: symbol.toUpperCase(),
            name,
            image,
          });

      if (result?.success) {
        toast.success(
          originalStatus ? "Removed from Watchlist" : "Added to Watchlist",
        );
      }
    } catch (error) {
      if (originalStatus) addCoinId(coinId);
      else removeCoinId(coinId);

      toast.error("Failed to update watchlist");
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWatchlist();
  };

  if (type === "icon") {
    if (showTrashIcon && isAdded) {
      return (
        <button
          className="w-fit cursor-pointer hover:bg-transparent text-red-500 hover:text-red-400"
          onClick={handleClick}
          aria-label="Remove from watchlist"
        >
          <Trash2 />
        </button>
      );
    }

    return (
      <button
        className={`w-fit cursor-pointer hover:bg-transparent text-gray-400 hover:text-yellow-500 ${
          isAdded ? "text-yellow-500 hover:text-yellow-600" : ""
        }`}
        onClick={handleClick}
        aria-label={isAdded ? "Remove from watchlist" : "Add to watchlist"}
      >
        <Star fill={isAdded ? "currentColor" : "none"} />
      </button>
    );
  }

  return (
    <button
      className={`text-base w-full rounded h-11 font-semibold cursor-pointer ${
        isAdded
          ? "bg-red-500 hover:bg-red-500 text-gray-900"
          : "bg-yellow-500 hover:bg-yellow-500 text-gray-900"
      }`}
      onClick={handleClick}
    >
      {showTrashIcon && isAdded ? <Trash2 className="inline mr-2" /> : null}
      <span>{isAdded ? "Remove from Watchlist" : "Add to Watchlist"}</span>
    </button>
  );
}
