import { DataTable } from "@/components/crypto/DataTable";
import Categories from "@/components/crypto/home/Categories";
import CoinOverview from "@/components/crypto/home/CoinOverview";
import {
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from "@/components/crypto/home/fallback";
import TrendingCoins from "@/components/crypto/home/TrendingCoins";
import TradingViewWidget from "@/components/stock/TradingViewWidget";
import { fetcher } from "@/lib/actions/coingecko.actions";
import {
  HEATMAP_WIDGET_CONFIG,
  SCREENER_CRYPTO_WIDGET_CONFIG,
} from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";

export default async function Page() {
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
  return (
    <div className="flex min-h-screen text-gray-400 flex-col gap-4 md:gap-10 items-center sm:items-start">
      <section className="grid w-full gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-1 xl:col-span-1 ">
          <Suspense fallback={<TrendingCoinsFallback />}>
            <TrendingCoins />
          </Suspense>
        </div>
        <div className="md:col-span-1 xl:col-span-2">
          <TradingViewWidget
            title="Crypto Heat Map"
            scriptUrl={`${scriptUrl}crypto-coins-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            height={600}
          />
        </div>
      </section>
      <section className="grid w-full gap-8 grid-cols-1">
        <TradingViewWidget
          title="Crypto Market"
          scriptUrl={`${scriptUrl}screener.js`}
          config={SCREENER_CRYPTO_WIDGET_CONFIG}
          height={600}
        />
      </section>
    </div>
  );
}
