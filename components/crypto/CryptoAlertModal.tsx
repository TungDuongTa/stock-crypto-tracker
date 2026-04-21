"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InputField from "../forms/InputField";
import SelectField from "../forms/SelectField";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import {
  createCryptoAlert,
  updateCryptoAlert,
} from "@/lib/actions/crypto-alert.actions";
import { CONDITION_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";

type CryptoAlertModalProps = {
  alertId?: string;
  alertData?: CryptoAlertData;
  action?: "create" | "edit";
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function CryptoAlertModal({
  alertId,
  alertData,
  action = "create",
  open,
  setOpen,
}: CryptoAlertModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CryptoAlertData>({
    defaultValues: {
      coinId: alertData?.coinId || "",
      symbol: alertData?.symbol || "",
      name: alertData?.name || "",
      alertName: alertData?.alertName || "",
      alertType: alertData?.alertType || "greater",
      threshold: alertData?.threshold || "",
      image: alertData?.image || "",
    },
  });

  useEffect(() => {
    if (!alertData) return;
    reset({
      coinId: alertData.coinId,
      symbol: alertData.symbol,
      name: alertData.name,
      alertName: alertData.alertName,
      alertType: alertData.alertType,
      threshold: alertData.threshold,
      image: alertData.image,
    });
  }, [alertData, reset]);

  const onSubmit = async (data: CryptoAlertData) => {
    try {
      const result =
        action === "create"
          ? await createCryptoAlert(data)
          : await updateCryptoAlert(alertId || "", data);

      if (result?.success) {
        toast.success(result.message);
        setOpen(false);
        reset();
      } else {
        toast.error(result?.error || "Failed to save alert");
      }
    } catch {
      toast.error("Error saving alert");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gray-800 border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">
            {action === "create" ? "Create New Alert" : "Edit Alert"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            name="alertName"
            label="Alert Name"
            placeholder="e.g., BTC Above $70,000"
            register={register}
            error={errors.alertName}
          />

          <InputField
            name="symbol"
            label="Coin symbol"
            placeholder="e.g., BTC"
            register={register}
            error={errors.symbol}
            disabled
          />

          <SelectField
            name="alertType"
            label="Condition"
            placeholder="Select condition"
            options={CONDITION_OPTIONS}
            control={control}
            error={errors.alertType}
          />

          <InputField
            name="threshold"
            label="Threshold value"
            placeholder="Enter price threshold (e.g., 70000)"
            type="number"
            register={register}
            error={errors.threshold}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 cursor-pointer bg-linear-to-b from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-gray-950 font-medium text-base rounded-lg shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

