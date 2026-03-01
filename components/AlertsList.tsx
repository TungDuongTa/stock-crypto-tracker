"use client";

import React, { useState } from "react";
import AlertModal from "./AlertModal";
import { deleteAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";

import { AlertCard } from "./AlertCard";

interface AlertsListProps {
  alertData: any[] | undefined; // Use your Alert type here
  onAlertDeleted?: () => void;
}

export default function AlertsList({
  alertData,
  onAlertDeleted,
}: AlertsListProps) {
  const [editingAlert, setEditingAlert] = useState<{
    id: string;
    data: AlertData;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    try {
      const result = await deleteAlert(alertId);
      if (result?.success) {
        toast.success("Alert deleted successfully");
        onAlertDeleted?.();
      }
    } catch (error) {
      toast.error("Error deleting alert");
    }
  };

  const handleEditAlert = (alert: any) => {
    setEditingAlert({
      id: alert._id,
      data: {
        symbol: alert.symbol,
        company: alert.company,
        alertName: alert.alertName,
        alertType: alert.alertType,
        threshold: alert.threshold.toString(),
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
          Prices are moving, don't miss out.
        </p>
      </div>
    );
  }

  return (
    <>
      <AlertModal
        alertId={editingAlert?.id}
        alertData={editingAlert?.data}
        action={editingAlert ? "edit" : "create"}
        open={isModalOpen}
        setOpen={setIsModalOpen}
      />

      <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
        {alertData.map((alert, index) => (
          <AlertCard
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
