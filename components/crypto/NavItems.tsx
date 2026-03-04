"use client";

import { CRYPTO_NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import SearchCommand from "../stock/SearchCommand";

export default function NavItems({
  initialStocks,
}: {
  initialStocks: StockWithWatchlistStatus[];
}) {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === "/crypto") return pathname === "/crypto";
    return pathname.startsWith(path);
  };
  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {CRYPTO_NAV_ITEMS.map(({ href, label }) => {
        if (href === "/search")
          return (
            <li key="search-trigger">
              <SearchCommand
                renderAs="icon"
                label="Search stock"
                initialStocks={initialStocks}
              />
            </li>
          );

        return (
          <li key={href}>
            <Link
              href={href}
              className={`relative after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom-left hover:after:scale-x-100 dark:after:bg-white cursor-pointer ${isActive(href) ? "text-gray-100" : ""} `}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
