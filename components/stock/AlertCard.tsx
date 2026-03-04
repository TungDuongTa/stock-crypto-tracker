"use client";
import { getCompanyLogo, getStockDetails } from "@/lib/actions/finhub.actions";
import { formatPrice } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AlertCardProps {
  alert: Alert;
  onEdit: (alert: Alert) => void;
  onDelete: (id: string) => void;
}

export function AlertCard({ alert, onEdit, onDelete }: AlertCardProps) {
  // Safe handling for change percentage

  const [stockDetails, setStockDetails] = useState<StockWithData | null>(null);
  // Fetch logo on the client side instead of making the whole component async
  useEffect(() => {
    const fetchLogo = async () => {
      const url = await getStockDetails(alert.symbol);
      setStockDetails(url);
    };
    fetchLogo();
  }, [alert.symbol]);
  return (
    <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 text-white shadow-lg">
      {/* Top Row: Symbol Info and Current Price */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-3 items-center">
          {/* Company Logo */}
          <div className="w-10 h-10 bg-[#2c2d31] rounded-md flex items-center justify-center overflow-hidden shrink-0">
            {stockDetails?.logo ? (
              <Image
                src={stockDetails.logo}
                alt={alert.symbol}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-xs font-bold text-gray-400">
                {alert.symbol}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-400 ">
              {alert.company}
            </h3>
            <p className="text-base font-medium">
              {formatPrice(stockDetails?.currentPrice || 0)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-medium text-gray-400 uppercase ">
            {alert.symbol}
          </p>
          <p
            className={`text-base font-medium ${
              stockDetails?.changePercent && stockDetails.changePercent >= 0
                ? "text-emerald-400"
                : "text-red-500"
            }`}
          >
            {stockDetails?.changePercent && stockDetails.changePercent >= 0
              ? "+"
              : ""}
            {stockDetails?.changePercent || 0}%
          </p>
        </div>
      </div>

      <hr className="border-[##313234] mb-4" />

      {/* Bottom Row: Alert Condition & Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xl text-[#CCDADC] font-medium">Alert:</span>
          <div className="flex gap-4">
            <button
              onClick={() => onEdit(alert)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(alert._id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold tracking-tight">
            Price{" "}
            {alert.alertType === "greater"
              ? ">"
              : alert.alertType === "less"
                ? "<"
                : "="}{" "}
            {formatPrice(Number(alert.threshold))}
          </p>
          <span className="bg-[#322d1d] text-[#e8c460] text-[10px] px-2 py-1 rounded font-semibold whitespace-nowrap">
            Once per day
          </span>
        </div>
      </div>
    </div>
  );
}
