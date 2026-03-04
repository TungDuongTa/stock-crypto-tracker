"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { Button } from "../ui/button";

import { useRouter } from "next/navigation";
import { cn, getChangeColorClass } from "@/lib/utils";
import WatchlistButton from "./WatchlistButton";
import AlertModal from "./AlertModal";
import { useState } from "react";

export function WatchlistTable({ watchlist }: WatchlistTableProps) {
  const router = useRouter();
  const [alertModal, setAlertModal] = useState<{
    open: boolean;
    stock: (typeof watchlist)[0] | null;
  }>({
    open: false,
    stock: null,
  });
  const handleAddAlert = (item: (typeof watchlist)[0]) => {
    setAlertModal({ open: true, stock: item });
  };
  return (
    <>
      {alertModal.stock && (
        <AlertModal
          alertData={{
            symbol: alertModal.stock.symbol,
            company: alertModal.stock.company,
            alertName: "",
            alertType: "greater",
            threshold: alertModal.stock.priceFormatted?.replace("$", "") || "",
          }}
          action="create"
          open={alertModal.open}
          setOpen={(open) =>
            setAlertModal({
              ...alertModal,
              open,
              stock: open ? alertModal.stock : null,
            })
          }
        />
      )}
      <Table className="scrollbar-hide relative! overflow-hidden w-full! bg-gray-800 border border-gray-600! rounded-lg!">
        <TableHeader>
          <TableRow className="text-gray-400 font-medium bg-gray-700 border-b border-gray-600 hover:bg-gray-700">
            {WATCHLIST_TABLE_HEADER.map((label) => (
              <TableHead className="pl-4" key={label}>
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.map((item, index) => (
            <TableRow
              key={item.symbol + index}
              className="border-b cursor-pointer text-gray-100 border-gray-600 hover:bg-gray-700/50 transition-colors"
              // onClick={() =>
              //   router.push(`/stocks/${encodeURIComponent(item.symbol)}`)
              // }
            >
              <TableCell className="pl-4 font-medium text-base">
                {item.company}
              </TableCell>
              <TableCell className="font-medium text-base">
                {item.symbol}
              </TableCell>
              <TableCell className="font-medium text-base">
                {item.priceFormatted || "—"}
              </TableCell>
              <TableCell
                className={cn(
                  "font-medium text-base",
                  getChangeColorClass(item.changePercent),
                )}
              >
                {item.changeFormatted || "—"}
              </TableCell>
              <TableCell className="font-medium text-base">
                {item.marketCap || "—"}
              </TableCell>
              <TableCell className="font-medium text-base">
                {item.peRatio || "—"}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleAddAlert(item)}
                  className="flex text-sm items-center whitespace-nowrap gap-1.5 px-3 w-fit py-2 text-yellow-600 border border-yellow-600/20 rounded font-medium bg-transparent hover:bg-transparent cursor-pointer transition-colors z-100"
                >
                  Add Alert
                </Button>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <WatchlistButton
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                  showTrashIcon={true}
                  type="icon"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
