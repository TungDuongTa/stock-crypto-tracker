"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatChangePercent } from "@/lib/utils";

type CryptoAlertCardProps = {
  alert: any;
  onEdit: (alert: any) => void;
  onDelete: (id: string) => void;
};

export function CryptoAlertCard({
  alert,
  onEdit,
  onDelete,
}: CryptoAlertCardProps) {
  const thresholdNumber = Number(alert.threshold);
  const symbol = String(alert.symbol || "").toUpperCase();
  const name = String(alert.name || symbol);

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex justify-between mb-4">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-[#2c2d31] rounded-md flex items-center justify-center overflow-hidden shrink-0">
            {alert.image ? (
              <Image
                src={alert.image}
                alt={name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-gray-400">{symbol}</span>
            )}
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-400">{name}</h3>
            <p className="text-base font-medium text-gray-300 uppercase">
              {symbol}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => onEdit(alert)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Edit alert"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(alert._id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Delete alert"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 whitespace-nowrap">
            Once per day
          </p>
        </div>
      </div>

      <hr className="border-[##313234] mb-4" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xl text-[#CCDADC] font-medium">Alert:</span>
          <span className="text-xs text-gray-400">{alert.alertName || ""}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold tracking-tight">
            Price{" "}
            {alert.alertType === "greater"
              ? ">"
              : alert.alertType === "less"
                ? "<"
                : "="}{" "}
            {formatCurrency(
              thresholdNumber,
              thresholdNumber < 1 ? 6 : 2,
              "USD",
              true,
            )}
          </p>
          <span className="text-xs text-gray-500">
            {typeof alert.priceChange24h === "number"
              ? `24h: ${formatChangePercent(alert.priceChange24h)}`
              : "aaa"}
          </span>
        </div>
      </div>
    </div>
  );
}
