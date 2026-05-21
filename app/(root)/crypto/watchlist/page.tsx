import { Star } from "lucide-react";
export const dynamic = "force-dynamic";
import SearchModal from "@/components/crypto/SearchModal";
import CryptoWatchlistTable from "@/components/crypto/CryptoWatchlistTable";
import { searchCoins } from "@/lib/actions/coingecko.actions";
import { getCryptoWatchlistWithData } from "@/lib/actions/crypto-watchlist.actions";
import { getUserCryptoAlerts } from "@/lib/actions/crypto-alert.actions";
import CryptoAlertsList from "@/components/crypto/CryptoAlertsList";

const CryptoWatchlistPage = async () => {
  const [watchlist, initialCoins] = await Promise.all([
    getCryptoWatchlistWithData(),
    searchCoins(),
  ]);
  const alerts = await getUserCryptoAlerts();

  if (watchlist.length === 0) {
    return (
      <section className="flex container gap-8 flex-col items-center md:mt-10 p-6 text-center">
        <div className="flex flex-col items-center justify-center text-center">
          <Star className="h-16 w-16 text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            Your crypto watchlist is empty
          </h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Start building your crypto watchlist by searching for coins and
            clicking the star icon.
          </p>
        </div>
        <SearchModal initialCoins={initialCoins} label="Add coin" />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3">
      <div className="flex flex-col gap-6 col-span-1 md:col-span-2 mx-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100">
            Crypto Watchlist
          </h2>
          <SearchModal initialCoins={initialCoins} label="Add coin" />
        </div>

        <div className="dark-scroll">
          <CryptoWatchlistTable watchlist={watchlist} />
        </div>
      </div>

      <div className="col-span-1 mx-2 flex gap-6 flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100">
            Alerts
          </h2>
        </div>

        <div className="relative! w-full! max-h-screen overflow-auto bg-gray-800 border border-gray-600! rounded-lg! p-4 dark-scroll">
          <CryptoAlertsList alertData={alerts} />
        </div>
      </div>
    </section>
  );
};

export default CryptoWatchlistPage;
