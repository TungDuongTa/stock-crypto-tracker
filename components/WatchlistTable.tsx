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
import { Button } from "./ui/button";

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
      <Table className="scrollbar-hide-default relative! overflow-hidden w-full! bg-gray-800 border border-gray-600! rounded-lg!">
        <TableHeader>
          <TableRow className="table-header-row">
            {WATCHLIST_TABLE_HEADER.map((label) => (
              <TableHead className="table-header" key={label}>
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.map((item, index) => (
            <TableRow
              key={item.symbol + index}
              className="table-row"
              // onClick={() =>
              //   router.push(`/stocks/${encodeURIComponent(item.symbol)}`)
              // }
            >
              <TableCell className="pl-4 table-cell">{item.company}</TableCell>
              <TableCell className="table-cell">{item.symbol}</TableCell>
              <TableCell className="table-cell">
                {item.priceFormatted || "—"}
              </TableCell>
              <TableCell
                className={cn(
                  "table-cell",
                  getChangeColorClass(item.changePercent),
                )}
              >
                {item.changeFormatted || "—"}
              </TableCell>
              <TableCell className="table-cell">
                {item.marketCap || "—"}
              </TableCell>
              <TableCell className="table-cell">
                {item.peRatio || "—"}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleAddAlert(item)}
                  className="add-alert z-100"
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
