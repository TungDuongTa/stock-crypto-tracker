import { Bell, Star } from "lucide-react";
export const dynamic = "force-dynamic";
import SearchCommand from "@/components/stock/SearchCommand";
import { getWatchlistWithData } from "@/lib/actions/watchlist.actions";
import { WatchlistTable } from "@/components/stock/WatchlistTable";
import { searchStocks } from "@/lib/actions/finhub.actions";
import { getUserAlerts } from "@/lib/actions/alert.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AlertsList from "@/components/stock/AlertsList";

const Watchlist = async () => {
  const watchlist = await getWatchlistWithData();
  const initialStocks = await searchStocks();
  const alerts = await getUserAlerts();
  // Empty state
  if (watchlist.length === 0) {
    return (
      <section className="flex container gap-8 flex-col items-center md:mt-10 p-6 text-center">
        <div className="flex flex-col items-center justify-center text-center">
          <Star className="h-16 w-16 text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            Your watchlist is empty
          </h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Start building your watchlist by searching for stocks and clicking
            the star icon to add them.
          </p>
        </div>
        <SearchCommand initialStocks={initialStocks} />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 ">
      <div className="flex flex-col gap-6 col-span-1 md:col-span-2 mx-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100">
            Watchlist
          </h2>
          <SearchCommand initialStocks={initialStocks} />
        </div>
        <div className="dark-scroll">
          <WatchlistTable watchlist={watchlist} />
        </div>
      </div>
      <div className="col-span-1 mx-2 flex gap-6 flex-col ">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100">
            Alerts
          </h2>
          {/* <SearchCommand initialStocks={initialStocks} /> */}
        </div>

        <div className="relative! w-full! max-h-screen overflow-auto bg-gray-800 border border-gray-600! rounded-lg! p-4 dark-scroll ">
          <AlertsList alertData={alerts} />
        </div>
      </div>
    </section>
  );
};

export default Watchlist;
