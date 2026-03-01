"use server";

import { Alert } from "@/database/models/alert.model";
import { connectToDatabase } from "@/database/mongoose";
import { auth } from "../better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCompanyLogo } from "./finhub.actions";
import { Types } from "mongoose";
import { id } from "zod/v4/locales";

export async function createAlert(alertData: AlertData) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    // Check if alert already exists
    const existingAlert = await Alert.findOne({
      userId: session.user.id,
      symbol: alertData.symbol.toUpperCase(),
      threshold: alertData.threshold,
    });

    if (existingAlert) {
      return { success: false, error: "Alert already exists for this price" };
    }

    const newAlert = new Alert({
      userId: session.user.id,
      symbol: alertData.symbol.toUpperCase(),
      company: alertData.company.trim(),
      alertName: alertData.alertName.trim(),
      // currentPrice: alertData.currentPrice || 0,
      alertType: alertData.alertType,
      threshold: alertData.threshold,
      // changePercent: alertData.changePercent || 0,
      logo: alertData.logo || null,
    });

    await newAlert.save();
    revalidatePath("/watchlist");
    revalidatePath("/alert");

    return { success: true, message: "Alert created successfully" };
  } catch (error) {
    console.error("Error creating alert:", error);
    throw new Error("Failed to create alert");
  }
}

export async function getUserAlerts() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    const alerts = await Alert.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(alerts));
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw new Error("Failed to fetch alerts");
  }
}

export async function updateAlert(alertId: string, alertData: AlertData) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }
    const objectId = new Types.ObjectId(alertId);
    const updatedAlert = await Alert.findByIdAndUpdate(
      objectId,
      {
        alertName: alertData.alertName?.trim(),
        alertType: alertData.alertType,
        threshold: alertData.threshold ? alertData.threshold : null,
      },
      { new: true },
    );

    if (!updatedAlert) {
      return { success: false, error: "Alert not found" };
    }

    revalidatePath("/watchlist");

    return { success: true, message: "Alert updated successfully" };
  } catch (error) {
    console.error("Error updating alert:", error);
    throw new Error("Failed to update alert");
  }
}

export async function deleteAlert(alertId: string) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    // Convert string ID to MongoDB ObjectId
    const objectId = new Types.ObjectId(alertId);

    const result = await Alert.findByIdAndDelete(objectId);

    if (!result) {
      return { success: false, error: "Alert not found" };
    }
    revalidatePath("/watchlist");

    return { success: true, message: "Alert deleted successfully" };
  } catch (error) {
    console.error("Error deleting alert:", error);
    throw new Error("Failed to delete alert");
  }
}

export async function getAllAlertsForPriceCheck() {
  try {
    await connectToDatabase();
    // const session = await auth.api.getSession({
    //   headers: await headers(),
    // });

    // if (!session?.user) {
    //   redirect("/sign-in");
    // }
    const alerts = await Alert.find({}).lean();
    return JSON.parse(JSON.stringify(alerts));
    console.log("Fetched alerts for price check:", alerts);
  } catch (error) {
    console.error("Error fetching all alerts:", error);
    return [];
  }
}
