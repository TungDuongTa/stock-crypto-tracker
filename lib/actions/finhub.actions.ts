"use server";

import {
  getDateRange,
  validateArticle,
  formatArticle,
  formatPrice,
  formatChangePercent,
  formatMarketCapValue,
} from "@/lib/utils";
import { POPULAR_STOCK_SYMBOLS } from "@/lib/constants";
import { cache } from "react";
import { auth } from "../better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistSymbolsByEmail } from "./watchlist.actions";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const NEXT_PUBLIC_FINNHUB_API_KEY =
  process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

function getToken() {
  const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!token) {
    throw new Error("FINNHUB API key is not configured");
  }
  return token;
}

export async function getNews(
  symbols?: string[],
): Promise<MarketNewsArticle[]> {
  try {
    // 1. Get API token
    const token =
      process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    if (!token) {
      throw new Error("FINNHUB API key is missing");
    }

    // 2. Prepare date range (last 5 days)
    const range = getDateRange(5);
    const MAX_ARTICLES = 6;

    // 3. Clean input symbols
    const cleanSymbols: string[] = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    // ======================================================
    // CASE 1: User provided stock symbols
    // ======================================================
    if (cleanSymbols.length > 0) {
      const articlesBySymbol: Record<string, RawNewsArticle[]> = {};

      // 4. Fetch news for each symbol
      for (const symbol of cleanSymbols) {
        try {
          const url =
            `${FINNHUB_BASE_URL}/company-news` +
            `?symbol=${symbol}` +
            `&from=${range.from}` +
            `&to=${range.to}` +
            `&token=${token}`;

          const res = await fetch(url, {
            cache: "force-cache",
            next: { revalidate: 300 },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch company news");
          }

          const data = (await res.json()) as RawNewsArticle[];

          // Keep only valid articles
          articlesBySymbol[symbol] = (data || []).filter(validateArticle);
        } catch (err) {
          console.error("Error fetching news for", symbol, err);
          articlesBySymbol[symbol] = [];
        }
      }

      // 5. Pick articles in round-robin order
      const finalArticles: MarketNewsArticle[] = [];

      let round = 0;
      while (finalArticles.length < MAX_ARTICLES) {
        let addedThisRound = false;

        for (const symbol of cleanSymbols) {
          const list = articlesBySymbol[symbol];
          if (!list || list.length === 0) continue;

          const article = list.shift();
          if (!article) continue;

          finalArticles.push(formatArticle(article, true, symbol, round));

          addedThisRound = true;
          if (finalArticles.length >= MAX_ARTICLES) break;
        }

        if (!addedThisRound) break;
        round++;
      }

      if (finalArticles.length > 0) {
        return finalArticles
          .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
          .slice(0, MAX_ARTICLES);
      }
    }

    // ======================================================
    // CASE 2: No symbols OR no company news → general news
    // ======================================================
    const generalUrl =
      `${FINNHUB_BASE_URL}/news` + `?category=general&token=${token}`;

    const res = await fetch(generalUrl, {
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch general news");
    }

    const generalNews = (await res.json()) as RawNewsArticle[];

    // 6. Remove duplicates & invalid articles
    const seen = new Set<string>();
    const validArticles: RawNewsArticle[] = [];

    for (const article of generalNews || []) {
      if (!validateArticle(article)) continue;

      const key = `${article.id}-${article.url}-${article.headline}`;
      if (seen.has(key)) continue;

      seen.add(key);
      validArticles.push(article);

      if (validArticles.length >= MAX_ARTICLES) break;
    }

    // 7. Format final result
    return validArticles.map((article, index) =>
      formatArticle(article, false, undefined, index),
    );
  } catch (error) {
    console.error("getNews error:", error);
    throw new Error("Failed to fetch news");
  }
}

export const searchStocks = cache(
  async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session?.user.id) {
        redirect("/sign-in");
      }
      const userWatchlistSymbols = await getWatchlistSymbolsByEmail(
        session.user.email,
      );
      // 1. Get API token
      const token =
        process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

      if (!token) {
        console.error("FINNHUB API key is missing");
        return [];
      }

      // 2. Clean search query
      const searchText = typeof query === "string" ? query.trim() : "";

      let searchResults: FinnhubSearchResult[] = [];

      // ======================================================
      // CASE 1: No search text → show popular stocks
      // ======================================================
      if (!searchText) {
        const popularSymbols = POPULAR_STOCK_SYMBOLS.slice(0, 10);

        const profiles: {
          country: string; // e.g. "US"
          currency: string; // e.g. "USD"
          estimateCurrency: string; // e.g. "USD"
          exchange: string; // e.g. "NASDAQ NMS - GLOBAL MARKET"
          finnhubIndustry: string; // e.g. "Technology"
          ipo: string; // ISO date string, e.g. "1980-12-12"
          logo: string; // URL
          marketCapitalization: number; // in millions (Finnhub format)
          name: string; // e.g. "Apple Inc"
          phone: string; // company phone number as string
          shareOutstanding: number; // in millions
          ticker: string; // e.g. "AAPL"
          weburl: string; // company website URL
        }[] = [];

        for (const symbol of popularSymbols) {
          try {
            const url =
              `${FINNHUB_BASE_URL}/stock/profile2` +
              `?symbol=${symbol}&token=${token}`;

            const res = await fetch(url, {
              cache: "force-cache",
              next: { revalidate: 3600 },
            });

            if (!res.ok) {
              throw new Error("Profile request failed");
            }

            const profile = await res.json();
            profiles.push(profile);
          } catch (err) {
            console.error("Profile fetch error:", symbol, err);
          }
        }

        // Convert profiles to search results
        for (const item of profiles) {
          if (!item.name) continue;

          searchResults.push({
            symbol: item.ticker.toUpperCase(),
            description: item.name,
            displaySymbol: item.ticker.toUpperCase(),
            type: "Common Stock",
          });
        }
      }

      // ======================================================
      // CASE 2: User typed something → search API
      // ======================================================
      else {
        const url =
          `${FINNHUB_BASE_URL}/search` +
          `?q=${encodeURIComponent(searchText)}` +
          `&token=${token}`;

        const res = await fetch(url, {
          cache: "force-cache",
          next: { revalidate: 1800 },
        });

        if (!res.ok) {
          throw new Error("Search request failed");
        }

        const data = (await res.json()) as FinnhubSearchResponse;
        searchResults = Array.isArray(data?.result) ? data.result : [];
      }

      // ======================================================
      // Convert API results into app format
      // ======================================================
      const finalResults: StockWithWatchlistStatus[] = [];

      for (const item of searchResults) {
        finalResults.push({
          symbol: item.symbol.toUpperCase(),
          name: item.description || item.symbol,
          exchange: item.displaySymbol || "US",
          type: item.type || "Stock",
          isInWatchlist: userWatchlistSymbols.includes(
            item.symbol.toUpperCase(),
          ),
        });
      }

      // 3. Limit results
      return finalResults.slice(0, 15);
    } catch (error) {
      console.error("searchStocks error:", error);
      return [];
    }
  },
);

export const getStockDetails = cache(async (symbol: string) => {
  const cleanSymbol = symbol.trim().toUpperCase();
  try {
    const token = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      throw new Error("Finhub token not found");
    }
    // price data (quote)
    const quoteUrl =
      `${FINNHUB_BASE_URL}/quote` + `?symbol=${cleanSymbol}&token=${token}`;
    //company profile (company profile 2)
    const profileUrl =
      `${FINNHUB_BASE_URL}/stock/profile2` +
      `?symbol=${cleanSymbol}&token=${token}`;

    // peer company
    const peersUrl =
      `${FINNHUB_BASE_URL}/stock/peers` +
      `?symbol=${cleanSymbol}&token=${token}`;
    // financial metrics
    const financialsUrl =
      `${FINNHUB_BASE_URL}/stock/metric` +
      `?symbol=${cleanSymbol}&metric=all&token=${token}`;
    // 4. Fetch data in parallel
    const [quoteRes, profileRes, peersRes, financialsRes] = await Promise.all([
      // Price data → always fresh
      fetch(quoteUrl, { cache: "no-store" }),

      // Company info → rarely changes
      fetch(profileUrl, {
        cache: "force-cache",
        next: { revalidate: 3600 },
      }),

      // Financial metrics → update sometimes
      fetch(peersUrl, {
        cache: "force-cache",
        next: { revalidate: 1800 },
      }),
      // Financial metrics → update frequently
      fetch(financialsUrl, {
        cache: "force-cache",
        next: { revalidate: 60 },
      }),
    ]);

    // 5. Check responses
    if (!quoteRes.ok) throw new Error("Quote fetch failed");
    if (!profileRes.ok) throw new Error("Profile fetch failed");
    if (!peersRes.ok) throw new Error("Financials fetch failed");
    if (!financialsRes.ok) throw new Error("Financials fetch failed");

    // 6. Parse JSON
    const quoteData = (await quoteRes.json()) as QuoteData;
    const profileData = (await profileRes.json()) as CompanyProfileData;
    const peersData = await peersRes.json();
    const financialsData = (await financialsRes.json()) as FinancialsData;

    // 7. Validate important fields
    if (!quoteData?.c || !profileData?.name) {
      throw new Error("Invalid stock data received");
    }

    // 8. Prepare derived values
    const changePercent = quoteData.dp || 0;
    const peRatio = financialsData?.metric?.peBasicExclExtraTTM ?? null;

    // 9. Return formatted result for UI
    return {
      symbol: cleanSymbol,
      logo: profileData.logo,
      company: profileData.name,
      currentPrice: quoteData.c,
      changePercent,
      priceFormatted: formatPrice(quoteData.c),
      changeFormatted: formatChangePercent(changePercent),
      peRatio: peRatio ? peRatio.toFixed(1) : "—",
      marketCapFormatted: formatMarketCapValue(
        profileData.marketCapitalization || 0,
      ),
    };
  } catch (error) {
    console.error(`Error fetching details for ${cleanSymbol}:`, error);
    throw new Error("Failed to fetch stock details");
  }
});

export async function getCompanyLogo(symbol: string): Promise<string | null> {
  try {
    const token = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      return null;
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    const url =
      `${FINNHUB_BASE_URL}/stock/profile2` +
      `?symbol=${cleanSymbol}&token=${token}`;

    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { logo?: string };
    return data.logo || null;
  } catch (error) {
    console.error(`Error fetching logo for ${symbol}:`, error);
    return null;
  }
}
