import Image from "next/image";
import Link from "next/link";

import NavItems from "./NavItems";
import UserDropDown from "../stock/UserDropDown";
import CryptoWatchlistSync from "./CryptoWatchlistSync";
import { searchCoins } from "@/lib/actions/coingecko.actions";
import { searchStocks } from "@/lib/actions/finhub.actions";
import { getCryptoWatchlistIdsByEmail } from "@/lib/actions/crypto-watchlist.actions";

export default async function Header({ user }: { user: User }) {
  const [initialCoins, initialStocks, coinIds] = await Promise.all([
    searchCoins(),
    searchStocks(),
    user?.email
      ? getCryptoWatchlistIdsByEmail(user.email)
      : Promise.resolve([]),
  ]);

  return (
    <>
      <CryptoWatchlistSync initialCoinIds={coinIds} />
      <header className="sticky top-0 z-50 w-full h-17.5 bg-gray-800">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 flex justify-between items-center py-4 text-gray-500">
          <Link href="/">
            <Image
              src="/assets/icons/logo.svg"
              alt="Signalist logo"
              width={140}
              height={32}
              className="h-8 w-auto cursor-pointer"
            />
          </Link>
          <nav className="hidden sm:block">
            <NavItems initialCoins={initialCoins} />
          </nav>
          <UserDropDown user={user} initialStocks={initialStocks} />
        </div>
      </header>
    </>
  );
}
