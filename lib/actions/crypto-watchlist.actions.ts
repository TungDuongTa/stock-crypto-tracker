"use server";

import { connectToDatabase } from "@/database/mongoose";
import { CryptoWatchlist } from "@/database/models/crypto-watchlist.model";
import { auth } from "../better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { fetcher } from "./coingecko.actions";

type AddCryptoCoinInput = {
  coinId: string;
  symbol: string;
  name: string;
  image?: string;
};

type CoinMarketLite = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
};

export type CryptoWatchlistWithData = {
  coinId: string;
  symbol: string;
  name: string;
  image?: string;
  currentPrice?: number;
  priceChange24h?: number;
  marketCap?: number;
  totalVolume?: number;
  addedAt?: Date;
};

export async function getCryptoWatchlistIdsByEmail(email: string) {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Database connection not found");

    const user = await db.collection("user").findOne({ email });
    if (!user) return [];

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) return [];

    const watchlistItems = await CryptoWatchlist.find(
      { userId },
      { coinId: 1 },
    ).lean();

    return watchlistItems.map((item) => item.coinId);
  } catch (error) {
    console.error("Error fetching crypto watchlist ids:", error);
    return [];
  }
}

export async function addToCryptoWatchlist(coin: AddCryptoCoinInput) {
  try {
    await connectToDatabase();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    const existing = await CryptoWatchlist.findOne({
      userId: session.user.id,
      coinId: coin.coinId,
    });

    if (existing) {
      return { success: false, error: "Coin already in watchlist" };
    }

    await CryptoWatchlist.create({
      userId: session.user.id,
      coinId: coin.coinId,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name.trim(),
      image: coin.image || "",
    });

    revalidatePath("/crypto/watchlist");
    return { success: true, message: "Coin added to watchlist" };
  } catch (error) {
    console.error("Error adding coin to watchlist:", error);
    throw new Error("Failed to add coin to watchlist");
  }
}

export async function removeFromCryptoWatchlist(coinId: string) {
  try {
    await connectToDatabase();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    await CryptoWatchlist.deleteOne({
      userId: session.user.id,
      coinId,
    });

    revalidatePath("/crypto/watchlist");
    return { success: true, message: "Coin removed from watchlist" };
  } catch (error) {
    console.error("Error removing coin from watchlist:", error);
    throw new Error("Failed to remove coin from watchlist");
  }
}

export async function getUserCryptoWatchlist() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    const watchlist = await CryptoWatchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(watchlist));
  } catch (error) {
    console.error("Error fetching user crypto watchlist:", error);
    throw new Error("Failed to fetch crypto watchlist");
  }
}

export async function getCryptoWatchlistWithData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    const watchlist = await CryptoWatchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    if (watchlist.length === 0) return [];

    const ids = watchlist.map((item) => item.coinId).join(",");

    let marketData: CoinMarketLite[] = [];
    try {
      marketData = await fetcher<CoinMarketLite[]>("coins/markets", {
        vs_currency: "usd",
        ids,
        sparkline: "false",
        price_change_percentage: "24h",
      });
    } catch (error) {
      console.error("Error fetching CoinGecko market data:", error);
    }

    const marketById = new Map(marketData.map((coin) => [coin.id, coin]));

    const result: CryptoWatchlistWithData[] = watchlist.map((item) => {
      const live = marketById.get(item.coinId);

      return {
        coinId: item.coinId,
        symbol: (live?.symbol || item.symbol).toUpperCase(),
        name: live?.name || item.name,
        image: live?.image || item.image,
        currentPrice: live?.current_price,
        priceChange24h: live?.price_change_percentage_24h,
        marketCap: live?.market_cap,
        totalVolume: live?.total_volume,
        addedAt: item.addedAt,
      };
    });

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Error loading crypto watchlist:", error);
    throw new Error("Failed to fetch crypto watchlist");
  }
}
