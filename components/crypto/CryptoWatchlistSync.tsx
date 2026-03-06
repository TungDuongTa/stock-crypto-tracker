"use client";

import { useEffect } from "react";
import { useCryptoWatchlistStore } from "@/lib/stores/useCryptoWatchlistStore";

export default function CryptoWatchlistSync({
  initialCoinIds,
}: {
  initialCoinIds: string[];
}) {
  const setCoinIds = useCryptoWatchlistStore((state) => state.setCoinIds);

  useEffect(() => {
    setCoinIds(initialCoinIds);
  }, [initialCoinIds, setCoinIds]);

  return null;
}
