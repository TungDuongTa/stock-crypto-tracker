"use client";

import React, { useState, useEffect } from "react";
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
import { createAlert, updateAlert } from "@/lib/actions/alert.actions";
import { ALERT_TYPE_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";

export default function AlertModal({
  alertId,
  alertData,
  action = "create",
  open,
  setOpen,
}: AlertModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AlertData>({
    defaultValues: {
      symbol: alertData?.symbol || "",
      company: alertData?.company || "",
      alertName: alertData?.alertName || "",
      alertType: alertData?.alertType || "greater",
      threshold: alertData?.threshold || "",
      logo: alertData?.logo || "",
    },
  });
  useEffect(() => {
    if (alertData && action === "edit") {
      reset({
        symbol: alertData.symbol,
        company: alertData.company,
        alertName: alertData.alertName,
        alertType: alertData.alertType,
        threshold: alertData.threshold,
        logo: alertData.logo,
      });
    }
  }, [alertData, action, reset]);
  const onSubmit = async (data: AlertData) => {
    try {
      const result =
        action === "create"
          ? await createAlert(data)
          : await updateAlert(alertId || "", data);

      if (result?.success) {
        toast.success(result.message);
        setOpen(false);
        reset();
      } else {
        toast.error(result?.error || "Failed to save alert");
      }
    } catch (error) {
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
            placeholder="e.g., Apple Above $150"
            register={register}
            error={errors.alertName}
          />
          <InputField
            name="symbol"
            label="Stock identifier"
            placeholder="e.g., AAPL"
            register={register}
            error={errors.symbol}
            disabled={action === "edit"}
          />

          {/* <SelectField
            name="alertType"
            label="Alert Type"
            placeholder="Select alert type"
            options={ALERT_TYPE_OPTIONS}
            control={control}
            error={errors.alertType}
          /> */}
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
            placeholder={`Enter price threshold (e.g., 150)`}
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
