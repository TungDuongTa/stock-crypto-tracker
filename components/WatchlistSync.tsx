"use client";
import { useWatchlistStore } from "@/lib/stores/useWatchlistStore";
import { useEffect } from "react";

export default function WatchlistSync({
  initialSymbols,
}: {
  initialSymbols: string[];
}) {
  const setSymbols = useWatchlistStore((state) => state.setSymbols);

  useEffect(() => {
    setSymbols(initialSymbols);
  }, [initialSymbols, setSymbols]);

  return null; // This component renders nothing, just syncs data
}
