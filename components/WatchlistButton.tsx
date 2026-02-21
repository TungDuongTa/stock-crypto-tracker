"use client";

import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/actions/watchlist.actions";
import { useWatchlistStore } from "@/lib/stores/useWatchlistStore";
import { Star, Trash2 } from "lucide-react";
import React, { useMemo } from "react";
import { toast } from "sonner";

const WatchlistButton = ({
  symbol,
  company,
  showTrashIcon = false,
  type = "button",
}: WatchlistButtonProps) => {
  // Use Zustand instead of local useState
  const symbols = useWatchlistStore((state) => state.symbols);
  const addSymbol = useWatchlistStore((state) => state.addSymbol);
  const removeSymbol = useWatchlistStore((state) => state.removeSymbol);

  const isAdded = useMemo(
    () => symbols.includes(symbol.toUpperCase()),
    [symbols, symbol],
  );

  const toggleWatchlist = async () => {
    const originalStatus = isAdded;

    // 1. Optimistic Update in Zustand
    if (originalStatus) {
      removeSymbol(symbol);
    } else {
      addSymbol(symbol);
    }

    try {
      const result = originalStatus
        ? await removeFromWatchlist(symbol)
        : await addToWatchlist(symbol, company);

      if (result?.success) {
        toast.success(
          originalStatus ? "Removed from Watchlist" : "Added to Watchlist",
        );
      }
    } catch (error) {
      // 2. Rollback if server fails
      if (originalStatus) addSymbol(symbol);
      else removeSymbol(symbol);
      toast.error("Failed to update watchlist");
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWatchlist();
  };

  if (type === "icon") {
    return (
      <button
        className={`watchlist-icon-btn ${isAdded ? "watchlist-icon-added" : ""}`}
        onClick={handleClick}
      >
        <Star fill={isAdded ? "currentColor" : "none"} />
      </button>
    );
  }

  return (
    <button
      className={`watchlist-btn ${isAdded ? "watchlist-remove" : ""}`}
      onClick={handleClick}
    >
      {showTrashIcon && isAdded ? <Trash2 /> : null}
      <span>{isAdded ? "Remove from Watchlist" : "Add to Watchlist"}</span>
    </button>
  );
};

export default WatchlistButton;
