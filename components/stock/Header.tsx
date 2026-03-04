import Image from "next/image";
import Link from "next/link";
import React from "react";
import NavItems from "./NavItems";
import UserDropDown from "./UserDropDown";
import { searchStocks } from "@/lib/actions/finhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import WatchlistSync from "./WatchlistSync";

export default async function Header({ user }: { user: User }) {
  const initialStocks = await searchStocks();
  const symbols = user?.email
    ? await getWatchlistSymbolsByEmail(user.email)
    : [];
  return (
    <>
      <WatchlistSync initialSymbols={symbols} />
      <header className="sticky top-0 z-50 w-full h-17.5 bg-gray-800">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 flex justify-between items-center py-4 text-gray-500">
          <Link href="/">
            <Image
              src="/assets/icons/logo.svg"
              alt="Signalist logo"
              width={140}
              height={32}
              className="h-8 w-auto cursor-pointer "
            />
          </Link>
          <nav className="hidden sm:block">
            <NavItems initialStocks={initialStocks} />
          </nav>
          <UserDropDown user={user} initialStocks={initialStocks} />
        </div>
      </header>
    </>
  );
}
