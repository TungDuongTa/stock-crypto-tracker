import { fetcher } from "@/lib/actions/coingecko.actions";
import { cn, formatChangePercent, formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { DataTable } from "../DataTable";

export default async function TrendingCoins() {
  const trendingCoins = await fetcher<{ coins: TrendingCoin[] }>(
    "/search/trending",
    undefined,
    300,
  );
  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: "Name",
      cellClassName: "name-cell",
      cell: (coin) => {
        const item = coin.item;
        return (
          <Link
            href={`/crypto/coins/${item.id}`}
            className="flex gap-2 items-center "
          >
            <div className="flex items-center">
              <Image src={item.large} alt={item.name} width={36} height={36} />
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="text-white font-medium text-base truncate max-w-40">
                {item.name}
              </p>
              <p className="text-sm text-gray-400">{item.symbol}</p>
            </div>
          </Link>
        );
      },
    },
    {
      header: "24h Change",
      cellClassName: "name-cell",
      cell: (coin) => {
        const item = coin.item;
        const isTrendingUp = item.data.price_change_percentage_24h.usd > 0;
        return (
          <div
            className={cn(
              "flex gap-1 items-center text-sm font-medium",
              isTrendingUp ? "text-green-500" : "text-red-500",
            )}
          >
            <p className="flex gap-2 items-center justsify-start">
              {formatChangePercent(item.data.price_change_percentage_24h.usd)}
              {isTrendingUp ? (
                <TrendingUp width={16} height={16} />
              ) : (
                <TrendingDown width={16} height={16} />
              )}
            </p>
          </div>
        );
      },
    },
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (coin) => formatCurrency(coin.item.data.price),
    },
  ];
  return (
    <div
      id="trending-coins"
      className="mx-auto w-full rounded-xl h-163 relative flex flex-col dark-scroll"
    >
      <h3 className="font-semibold text-2xl text-gray-100 mb-5">
        Trending Coins
      </h3>
      <DataTable
        data={trendingCoins.coins.slice(0, 7) || []}
        columns={columns}
        rowKey={(coin) => coin.item.id}
        tableClassName="dark-scroll relative! overflow-hidden w-full! bg-gray-800 border border-gray-600! rounded-lg!"
        headerCellClassName="py-3! "
        bodyCellClassName="py-2!"
      />
    </div>
  );
}
