import Image from "next/image";
import Link from "next/link";

import { cn, formatChangePercent, formatPrice } from "@/lib/utils";
import { DataTable } from "@/components/crypto/DataTable";
import { fetcher } from "@/lib/actions/coingecko.actions";
import CoinsPagination from "@/components/crypto/CoinsPagination";
import { TrendingDown, TrendingUp } from "lucide-react";

const Coins = async ({ searchParams }: NextPageProps) => {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const perPage = 10;

  const coinsData = await fetcher<CoinMarketData[]>("/coins/markets", {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: perPage,
    page: currentPage,
    sparkline: "false",
    price_change_percentage: "24h",
  });

  const columns: DataTableColumn<CoinMarketData>[] = [
    {
      header: "Rank",
      cellClassName: "rank-cell",
      cell: (coin) => (
        <>
          #{coin.market_cap_rank}
          <Link href={`/coins/${coin.symbol}`} aria-label="View coin" />
        </>
      ),
    },
    {
      header: "Token",
      cellClassName: "token-cell",
      cell: (coin) => (
        <Link
          className="flex gap-2 items-center"
          href={`/crypto/coins/${coin.symbol.toUpperCase()}`}
        >
          <Image src={coin.image} alt={coin.name} width={36} height={36} />
          <div className="flex flex-col gap-0.5 justify-center">
            <p className="text-white font-medium text-base truncate max-w-40">
              {coin.name}
            </p>
            <p className="text-gray-400 text-sm">{coin.symbol.toUpperCase()}</p>
          </div>
        </Link>
      ),
    },
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (coin) => formatPrice(coin.current_price),
    },
    {
      header: "24h Change",
      cellClassName: "change-cell",
      cell: (coin) => {
        const isTrendingUp = coin.price_change_percentage_24h > 0;

        return (
          <div
            className={cn(
              "flex gap-1 items-center text-sm font-medium",
              isTrendingUp ? "text-green-500" : "text-red-500",
            )}
          >
            <p className="flex gap-2 items-center justsify-start">
              {formatChangePercent(coin.price_change_percentage_24h)}
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
      header: "Market Cap",
      cellClassName: "market-cap-cell",
      cell: (coin) => formatPrice(coin.market_cap),
    },
  ];

  const hasMorePages = coinsData.length === perPage;
  const estimatedTotalPages =
    currentPage >= 100 ? Math.ceil(currentPage / 100) * 100 + 100 : 100;

  return (
    <main id="coins-page">
      <div className="flex flex-col w-full space-y-5">
        <h3 className="font-semibold text-2xl text-gray-100 mb-5">
          Trending Coins
        </h3>

        <DataTable
          columns={columns}
          data={coinsData}
          rowKey={(coin) => coin.id}
          tableClassName="dark-scroll relative! overflow-hidden w-full! bg-gray-800 border border-gray-600! rounded-lg!"
          headerCellClassName="py-3! "
          bodyCellClassName="py-2!"
        />
        <CoinsPagination
          currentPage={currentPage}
          totalPages={estimatedTotalPages}
          hasMorePages={hasMorePages}
        />
      </div>
    </main>
  );
};

export default Coins;
