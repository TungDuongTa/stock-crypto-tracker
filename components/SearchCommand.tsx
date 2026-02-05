"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";
import { searchStocks } from "@/lib/actions/finhub.actions";
import { Loader2, Search, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

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
    if (!isSearchMode) {
      return setStocks(initialStocks);
    }
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

  const debouncedSeach = useDebounce(handleSearch, 300);
  useEffect(() => {
    debouncedSeach();
  }, [searchValue]);
  const handleSelectStock = () => {
    setOpen(false);
    setSearchValue("");
    setStocks(initialStocks);
  };
  return (
    <>
      {renderAs === "icon" ? (
        <Search className="cursor-pointer " onClick={() => setOpen(true)}>
          {label}
        </Search>
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
          <div className="bg-gray-800! relative">
            <CommandInput
              className=" text-gray-400 placeholder:text-gray-500 h-14 pr-10 "
              placeholder="Type a command or search..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            {loading && (
              <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 animate-spin" />
            )}
          </div>

          <CommandList className="bg-gray-800!">
            {loading ? (
              <CommandEmpty>Loading stock...</CommandEmpty>
            ) : displayStock?.length === 0 ? (
              <div className="px-5 py-2">
                {isSearchMode ? "No result found" : "No stock avaialble"}
              </div>
            ) : (
              <ul>
                <div className="py-2 px-4 text-sm font-medium text-gray-400 bg-gray-700 border-b border-gray-700">
                  {isSearchMode ? "Search results" : "Popular stocks"}
                  {` `}({displayStock?.length || 0} )
                </div>
                {displayStock?.map((stock, index) => (
                  <li key={stock.symbol} className="search-item">
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      onClick={handleSelectStock}
                      className="search-item-link"
                    >
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="search-item-name">{stock.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} | {stock.exchange} | {stock.type}
                        </div>
                      </div>
                      <Star />
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
