"use server";

import { connectToDatabase } from "@/database/mongoose";
import { CryptoAlertModel } from "@/database/models/crypto-alert.model";
import { auth } from "../better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { fetcher } from "./coingecko.actions";
type CoinMarketLite = {
  id: string;
  price_change_percentage_24h: number;
};
export async function createCryptoAlert(alertData: CryptoAlertData) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    const existing = await CryptoAlertModel.findOne({
      userId: session.user.id,
      coinId: alertData.coinId,
      threshold: Number(alertData.threshold),
      alertType: alertData.alertType,
    });

    if (existing) {
      return { success: false, error: "Alert already exists for this price" };
    }

    await CryptoAlertModel.create({
      userId: session.user.id,
      coinId: alertData.coinId,
      symbol: alertData.symbol.toUpperCase(),
      name: alertData.name.trim(),
      alertName: alertData.alertName.trim(),
      alertType: alertData.alertType,
      threshold: Number(alertData.threshold),
      image: alertData.image || "",
    });

    revalidatePath("/crypto/watchlist");
    return { success: true, message: "Alert created successfully" };
  } catch (error) {
    console.error("Error creating crypto alert:", error);
    throw new Error("Failed to create crypto alert");
  }
}

export async function getUserCryptoAlerts() {
  try {
    await connectToDatabase();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    const alerts = await CryptoAlertModel.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (alerts.length === 0) return [];

    const ids = [...new Set(alerts.map((item) => item.coinId))]
      .filter(Boolean)
      .join(",");

    let marketData: CoinMarketLite[] = [];
    if (ids) {
      try {
        marketData = await fetcher<CoinMarketLite[]>("coins/markets", {
          vs_currency: "usd",
          ids,
          sparkline: "false",
          price_change_percentage: "24h",
        });
      } catch (error) {
        console.error(
          "Error fetching CoinGecko market data for alerts:",
          error,
        );
      }
    }

    const marketById = new Map(marketData.map((coin) => [coin.id, coin]));

    const alertsWithData = alerts.map((alert) => ({
      ...alert,
      priceChange24h: marketById.get(alert.coinId)?.price_change_percentage_24h,
    }));

    return JSON.parse(JSON.stringify(alertsWithData));
  } catch (error) {
    console.error("Error fetching crypto alerts:", error);
    throw new Error("Failed to fetch crypto alerts");
  }
}

export async function updateCryptoAlert(
  alertId: string,
  alertData: CryptoAlertData,
) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    const objectId = new Types.ObjectId(alertId);
    const updated = await CryptoAlertModel.findByIdAndUpdate(
      objectId,
      {
        alertName: alertData.alertName?.trim(),
        alertType: alertData.alertType,
        threshold:
          alertData.threshold !== undefined
            ? Number(alertData.threshold)
            : null,
      },
      { new: true },
    );

    if (!updated) {
      return { success: false, error: "Alert not found" };
    }

    revalidatePath("/crypto/watchlist");
    return { success: true, message: "Alert updated successfully" };
  } catch (error) {
    console.error("Error updating crypto alert:", error);
    throw new Error("Failed to update crypto alert");
  }
}

export async function deleteCryptoAlert(alertId: string) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    const objectId = new Types.ObjectId(alertId);
    const result = await CryptoAlertModel.findByIdAndDelete(objectId);

    if (!result) {
      return { success: false, error: "Alert not found" };
    }

    revalidatePath("/crypto/watchlist");
    return { success: true, message: "Alert deleted successfully" };
  } catch (error) {
    console.error("Error deleting crypto alert:", error);
    throw new Error("Failed to delete crypto alert");
  }
}

export async function getAllCryptoAlertsForPriceCheck() {
  try {
    await connectToDatabase();
    const alerts = await CryptoAlertModel.find({}).lean();
    return JSON.parse(JSON.stringify(alerts));
  } catch (error) {
    console.error("Error fetching all crypto alerts:", error);
    return [];
  }
}
