"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import CryptoAlertModal from "./CryptoAlertModal";
import { CryptoAlertCard } from "./CryptoAlertCard";
import { deleteCryptoAlert } from "@/lib/actions/crypto-alert.actions";

type CryptoAlertsListProps = {
  alertData: any[] | undefined;
  onAlertDeleted?: () => void;
};

export default function CryptoAlertsList({
  alertData,
  onAlertDeleted,
}: CryptoAlertsListProps) {
  const [editingAlert, setEditingAlert] = useState<{
    id: string;
    data: CryptoAlertData;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    try {
      const result = await deleteCryptoAlert(alertId);
      if (result?.success) {
        toast.success("Alert deleted successfully");
        onAlertDeleted?.();
      }
    } catch {
      toast.error("Error deleting alert");
    }
  };

  const handleEditAlert = (alert: any) => {
    setEditingAlert({
      id: alert._id,
      data: {
        coinId: alert.coinId,
        symbol: alert.symbol,
        name: alert.name,
        alertName: alert.alertName,
        alertType: alert.alertType,
        threshold: String(alert.threshold),
        image: alert.image,
      },
    });
    setIsModalOpen(true);
  };

  if (!alertData || alertData.length === 0) {
    return (
      <div className="text-center py-20 bg-[#1a1b1e] rounded-xl border border-dashed border-gray-800">
        <p className="text-gray-400 text-lg font-medium">
          No alerts created yet
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Crypto moves fast, don't miss out.
        </p>
      </div>
    );
  }

  return (
    <>
      <CryptoAlertModal
        alertId={editingAlert?.id}
        alertData={editingAlert?.data}
        action={editingAlert ? "edit" : "create"}
        open={isModalOpen}
        setOpen={setIsModalOpen}
      />

      <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
        {alertData.map((alert, index) => (
          <CryptoAlertCard
            key={index}
            alert={alert}
            onEdit={handleEditAlert}
            onDelete={handleDeleteAlert}
          />
        ))}
      </div>
    </>
  );
}

