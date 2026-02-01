"use server";

import { Watchlist } from "@/database/models/watchlist.model";
import { connectToDatabase } from "@/database/mongoose";

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
