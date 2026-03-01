"use server";

import { Watchlist } from "@/database/models/watchlist.model";
import { connectToDatabase } from "@/database/mongoose";
import { auth } from "../better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getStockDetails } from "./finhub.actions";

export async function getWatchlistSymbolsByEmail(email: string) {
  if (!email) {
    return [];
  }
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not found");
    }

    const user = await db.collection("user").findOne({ email });
    if (!user) {
      return [];
    }
    const userId = (user.id as string) || String(user._id || "");
    if (!userId) {
      return [];
    }
    const watchlistItems = await Watchlist.find(
      { userId },
      { symbol: 1 },
    ).lean();

    return watchlistItems.map((item) => item.symbol);
  } catch (error) {
    console.error("Error fetching watchlist symbols:", error);
    return [];
  }
}

export async function addToWatchlist(symbol: string, company: string) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      redirect("/sign-in");
    }
    // check if stock already exist
    const existSymbol = await Watchlist.findOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    });
    if (existSymbol) {
      return { success: false, error: "Stock already in watchlist" };
    }
    //add stock to watch list
    const newSymbol = new Watchlist({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      company: company.trim(),
    });

    await newSymbol.save();
    revalidatePath("/watchlist");

    return { success: true, error: "Stock added to watchlist" };
  } catch (error) {
    console.log("Error adding symbol to watchlist", error);
    throw new Error("Failed to add symbol to watchlist");
  }
}

export async function removeFromWatchlist(symbol: string) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }
    //remove stock from watchlist
    await Watchlist.deleteOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    });
    revalidatePath("/watchlist");

    return {
      success: true,
      message: "Symbol removed from watchlist successfully",
    };
  } catch (error) {
    console.log("Error removing symbol from watchlist", error);
  }
}

export async function getUserWatchlist() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      redirect("/sign-in");
    }
    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(watchlist));
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw new Error("Failed to fetch watchlist");
  }
}
// Get user's watchlist with stock data
export const getWatchlistWithData = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect("/sign-in");

    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    if (watchlist.length === 0) return [];

    const stocksWithData = await Promise.all(
      watchlist.map(async (item) => {
        const stockData = await getStockDetails(item.symbol);

        if (!stockData) {
          console.warn(`Failed to fetch data for ${item.symbol}`);
          return item;
        }

        return {
          company: stockData.company,
          symbol: stockData.symbol,
          currentPrice: stockData.currentPrice,
          priceFormatted: stockData.priceFormatted,
          changeFormatted: stockData.changeFormatted,
          changePercent: stockData.changePercent,
          marketCap: stockData.marketCapFormatted,
          peRatio: stockData.peRatio,
        };
      }),
    );

    return JSON.parse(JSON.stringify(stocksWithData));
  } catch (error) {
    console.error("Error loading watchlist:", error);
    throw new Error("Failed to fetch watchlist");
  }
};
