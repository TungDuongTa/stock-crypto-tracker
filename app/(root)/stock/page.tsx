import MarketNews from "@/components/stock/MarketNews";
import MarketNewsSkeleton from "@/components/stock/MarketNewsSkeleton";
import TradingViewWidget from "@/components/stock/TradingViewWidget";
import { Button } from "@/components/ui/button";
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  STOCK_MARKET_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants";
import { Suspense } from "react";

export default function Home() {
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
  return (
    <div className="flex min-h-screen text-gray-400 flex-col gap-4 md:gap-10 items-center sm:items-start">
      <section className="grid w-full gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-1 xl:col-span-1 ">
          <TradingViewWidget
            title="Market Overview"
            scriptUrl={`${scriptUrl}market-overview.js`}
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
            className="custom-chart "
            height={600}
          />
        </div>
        <div className="md:col-span-1 xl:col-span-2">
          <TradingViewWidget
            title="Stock Heat Map"
            scriptUrl={`${scriptUrl}stock-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            height={600}
          />
        </div>
      </section>

      <section className="grid w-full gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* <div className="h-full col-span-1 xl:col-span-1">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}timeline.js`}
            config={TOP_STORIES_WIDGET_CONFIG}
            className="custom-chart"
            height={600}
          />
        </div> */}
        <div className="h-full col-span-1 xl:col-span-1">
          <TradingViewWidget
            title="Top stocks daily"
            scriptUrl={`${scriptUrl}hotlists.js`}
            config={STOCK_MARKET_WIDGET_CONFIG}
            className="custom-chart"
            height={600}
          />
        </div>
        {/* <div className="h-full col-span-1 xl:col-span-2">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}market-quotes.js`}
            config={MARKET_DATA_WIDGET_CONFIG}
            height={600}
          />
        </div> */}
        <div className="h-full col-span-1 xl:col-span-2">
          <Suspense fallback={<MarketNewsSkeleton />}>
            <MarketNews />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
