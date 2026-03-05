import { fetcher } from "@/lib/actions/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import React from "react";

export default async function CoinOverview() {
  const coin = await fetcher<CoinDetailsData>("/coins/bitcoin", {
    dex_pair_fomat: "symbol",
  });
  return (
    <div
      id="coin-overview"
      className="w-full h-full xl:col-span-2 px-2 bg-[#1a2027] rounded-xl"
    >
      <div className="flex-1 mb-2 flex gap-2 md:gap-3">
        <Image
          src={coin.image.large}
          alt={coin.name}
          width={80}
          height={80}
          className="w-10 h-10 md:w-14 md:h-14"
        />
        <div className="flex flex-col gap-2">
          <p className="flex text-purple-100 text-xs md:text-sm w-fit">
            {coin.name}/{coin.symbol.toUpperCase()}
          </p>
          <h1 className="text-xl md:text-2xl font-semibold">
            {formatCurrency(coin.market_data.current_price.usd)}
          </h1>
        </div>
      </div>
    </div>
  );
}
