"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";
import { searchStocks } from "@/lib/actions/finhub.actions";
import { Loader2, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import WatchlistButton from "./WatchlistButton";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Notice: stocks now just uses the base Stock type, no status needed here!
  const [stocks, setStocks] = useState<Stock[]>(initialStocks || []);

  const isSearchMode = !!searchValue.trim();
  const displayStock = isSearchMode ? stocks : stocks?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchStocks(searchValue.trim());
      setStocks(results);
    } catch {
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchValue]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchValue(""); // Clear search on select
  };

  return (
    <>
      {renderAs === "icon" ? (
        <Search className="cursor-pointer" onClick={() => setOpen(true)} />
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="cursor-pointer px-4 py-2 w-fit flex items-center justify-center text-sm md:text-base bg-yellow-500 hover:bg-yellow-500 text-black font-medium rounded"
        >
          {label}
        </Button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="bg-gray-800! lg:min-w-200 border-gray-600 fixed top-10 left-1/2 -translate-x-1/2 translate-y-5"
      >
        <Command>
          <div className="bg-gray-800! border-b border-gray-600 relative">
            <CommandInput
              className="text-gray-400 placeholder:text-gray-500 h-14 pr-10"
              placeholder="Type a symbol or company name..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            {loading && (
              <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 animate-spin" />
            )}
          </div>

          <CommandList className="bg-gray-800! max-h-100">
            {loading ? (
              <CommandEmpty>Loading stocks...</CommandEmpty>
            ) : displayStock?.length === 0 ? (
              <div className="px-5 py-2">
                {isSearchMode ? "No result found" : "No stocks available"}
              </div>
            ) : (
              <ul>
                <div className="py-2 px-4 text-sm font-medium text-gray-400 bg-gray-700 border-b border-gray-700">
                  {isSearchMode ? "Search results" : "Popular stocks"}
                </div>
                {displayStock?.map((stock) => (
                  <li
                    key={stock.symbol}
                    className="rounded-none my-3 px-1 w-full data-[selected=true]:bg-gray-600"
                  >
                    {/* Link takes you to the page */}
                    <Link
                      href={`/stock/stocks/${stock.symbol}`}
                      onClick={handleSelectStock}
                      className="px-2 w-full cursor-pointer border-b border-gray-600 last:border-b-0 transition-colors flex items-center gap-3"
                    >
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className=" font-medium text-base text-gray-400">
                          {stock.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} | {stock.exchange}
                        </div>
                      </div>

                      <WatchlistButton
                        symbol={stock.symbol}
                        company={stock.name}
                        type="icon"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
