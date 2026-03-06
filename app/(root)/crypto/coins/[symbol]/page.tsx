import TradingViewWidget from "@/components/stock/TradingViewWidget";
import CryptoWatchlistButton from "@/components/crypto/CryptoWatchlistButton";
import { searchCoins } from "@/lib/actions/coingecko.actions";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";

export default async function CoinsDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;

  const normalizedSymbol = symbol.trim().toUpperCase();
  const fullSymbol = `${normalizedSymbol}USDT`;
  const scriptUrl =
    "https://s3.tradingview.com/external-embedding/embed-widget-";

  const candidates = await searchCoins(normalizedSymbol);
  const selectedCoin =
    candidates.find((coin) => coin.symbol.toUpperCase() === normalizedSymbol) ||
    candidates[0];

  const coinId = selectedCoin?.id || normalizedSymbol.toLowerCase();
  const coinName = selectedCoin?.name || normalizedSymbol;
  const coinImage = selectedCoin?.large || selectedCoin?.thumb;

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(fullSymbol)}
            height={170}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(fullSymbol)}
            className="custom-chart"
            height={600}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(fullSymbol)}
            className="custom-chart"
            height={600}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <CryptoWatchlistButton
              coinId={coinId}
              symbol={normalizedSymbol}
              name={coinName}
              image={coinImage}
              type="button"
            />
          </div>

          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(fullSymbol)}
            height={400}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(fullSymbol)}
            height={440}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(fullSymbol)}
            height={464}
          />
        </div>
      </section>
    </div>
  );
}
