"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatChangePercent, formatCurrency } from "@/lib/utils";
import type { CryptoWatchlistWithData } from "@/lib/actions/crypto-watchlist.actions";
import CryptoWatchlistButton from "./CryptoWatchlistButton";

export default function CryptoWatchlistTable({
  watchlist,
}: {
  watchlist: CryptoWatchlistWithData[];
}) {
  const router = useRouter();

  return (
    <Table className="dark-scroll relative overflow-hidden w-full bg-gray-800 border border-gray-600 rounded-lg">
      <TableHeader>
        <TableRow className="text-gray-400 font-medium bg-gray-700 border-b border-gray-600 hover:bg-gray-700">
          <TableHead className="pl-4">Coin</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>24h Change</TableHead>
          <TableHead>Market Cap</TableHead>
          <TableHead>24h Volume</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {watchlist.map((item) => {
          const priceDigits =
            item.currentPrice && item.currentPrice < 1 ? 6 : 2;

          return (
            <TableRow
              key={item.coinId}
              className="border-b cursor-pointer text-gray-100 border-gray-600 hover:bg-gray-700/50 transition-colors"
              onClick={() =>
                router.push(`/crypto/coins/${item.symbol.toUpperCase()}`)
              }
            >
              <TableCell className="pl-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={item.image || "/assets/icons/logo.svg"}
                    alt={item.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <span className="font-medium text-base">{item.name}</span>
                </div>
              </TableCell>

              <TableCell className="font-medium text-base">
                {item.symbol.toUpperCase()}
              </TableCell>

              <TableCell className="font-medium text-base">
                {item.currentPrice !== undefined
                  ? formatCurrency(item.currentPrice, priceDigits)
                  : "—"}
              </TableCell>

              <TableCell
                className={cn(
                  "font-medium text-base",
                  item.priceChange24h === undefined
                    ? "text-gray-400"
                    : item.priceChange24h >= 0
                      ? "text-green-500"
                      : "text-red-500",
                )}
              >
                {item.priceChange24h !== undefined
                  ? formatChangePercent(item.priceChange24h)
                  : "—"}
              </TableCell>

              <TableCell className="font-medium text-base">
                {item.marketCap !== undefined
                  ? formatCurrency(item.marketCap, 0)
                  : "—"}
              </TableCell>

              <TableCell className="font-medium text-base">
                {item.totalVolume !== undefined
                  ? formatCurrency(item.totalVolume, 0)
                  : "—"}
              </TableCell>

              <TableCell onClick={(e) => e.stopPropagation()}>
                <CryptoWatchlistButton
                  coinId={item.coinId}
                  symbol={item.symbol}
                  name={item.name}
                  image={item.image}
                  type="icon"
                  showTrashIcon
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
