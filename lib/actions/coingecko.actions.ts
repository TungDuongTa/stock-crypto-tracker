"use server";
import qs from "query-string";
import { cache } from "react";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error("Could not get base url");
if (!API_KEY) throw new Error("Could not get api key");

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      "x-cg-demo-api-key": API_KEY,
      "Content-Type": "application/json",
    } as Record<string, string>,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      `API Error: ${response.status}: ${errorBody.error || response.statusText} `,
    );
  }

  return response.json();
}
// Define the types for the search response to keep things type-safe

interface SearchResponse {
  coins: SearchCoin[];
}

export const searchCoins = cache(
  async (query?: string): Promise<SearchCoin[]> => {
    try {
      // 2. Clean search query
      const searchText = typeof query === "string" ? query.trim() : "";
      let finalCoins: SearchCoin[] = [];

      // ======================================================
      // CASE 1: No search text → show trending coins
      // ======================================================
      if (!searchText) {
        const data = await fetcher<{ coins: TrendingCoin[] }>(
          "search/trending",
          {},
          3600,
        );

        finalCoins = data.coins.map((c) => ({
          id: c.item.id,
          name: c.item.name,
          symbol: c.item.symbol.toUpperCase(),
          market_cap_rank: c.item.market_cap_rank,
          thumb: c.item.thumb,
          large: c.item.large,
          data: {
            price: c.item.data.price,
            price_change_percentage_24h:
              c.item.data.price_change_percentage_24h.usd,
          },
        }));
      }
      // ======================================================
      // CASE 2: User typed something → search API
      // ======================================================
      else {
        const data = await fetcher<SearchResponse>(
          "search",
          { query: searchText },
          1800,
        );

        // Note: The /search endpoint returns limited 'data' fields.
        // You might need a second call to /simple/price if you need live prices here.
        finalCoins = (data.coins || []).map((coin) => ({
          ...coin,
          symbol: coin.symbol.toUpperCase(),
        }));
      }

      // 3. Limit results (e.g., top 15)
      return finalCoins.slice(0, 15);
    } catch (error) {
      console.error("searchCoins error:", error);
      return [];
    }
  },
);
