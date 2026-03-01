import { Bell, Star } from "lucide-react";

import SearchCommand from "@/components/SearchCommand";
import { getWatchlistWithData } from "@/lib/actions/watchlist.actions";
import { WatchlistTable } from "@/components/WatchlistTable";
import { searchStocks } from "@/lib/actions/finhub.actions";
import { getUserAlerts } from "@/lib/actions/alert.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AlertsList from "@/components/AlertsList";

const Watchlist = async () => {
  const watchlist = await getWatchlistWithData();
  const initialStocks = await searchStocks();
  const alerts = await getUserAlerts();
  // Empty state
  if (watchlist.length === 0) {
    return (
      <section className="flex watchlist-empty-container">
        <div className="watchlist-empty">
          <Star className="watchlist-star" />
          <h2 className="empty-title">Your watchlist is empty</h2>
          <p className="empty-description">
            Start building your watchlist by searching for stocks and clicking
            the star icon to add them.
          </p>
        </div>
        <SearchCommand initialStocks={initialStocks} />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-3 ">
      <div className="flex flex-col gap-6 col-span-2 mx-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100">
            Watchlist
          </h2>
          <SearchCommand initialStocks={initialStocks} />
        </div>
        <WatchlistTable watchlist={watchlist} />
      </div>
      <div className="col-span-1 mx-2 flex gap-6 flex-col ">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100">
            Alerts
          </h2>
          <SearchCommand initialStocks={initialStocks} />
        </div>

        <div className="relative! w-full! max-h-screen overflow-auto bg-gray-800 border border-gray-600! rounded-lg! p-4 dark-scroll ">
          <AlertsList alertData={alerts} />
        </div>
      </div>
    </section>
  );
};

export default Watchlist;
