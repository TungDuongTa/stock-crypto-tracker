import TradingViewWidget from "@/components/stock/TradingViewWidget";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function HomePage() {
  return (
    <div className="flex flex-col gap-20 justify-center items-center min-h-screen">
      <div className="flex flex-col items-center">
        <p className="font-bold text-5xl bg-linear-to-b from-yellow-300 to-yellow-600 bg-clip-text text-transparent inline-block py-4">
          Crypto & Stock Tracker
        </p>
        <p className="text-neutral-400 text-2xl max-w-2xl mx-auto text-center">
          Monitor your digital assets and stock investments in real-time with
          beautiful, interactive cards
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-40 p-4 w-[50%] h-[50%]">
        <Link
          href="/crypto"
          className=" group rounded-2xl relative flex flex-col items-center justify-center gap-5 text-2xl hover:text-yellow-500 "
        >
          <div className="rounded-2xl overflow-hidden aspect-square w-full relative group-hover:scale-105 origin-bottom transition-transform  group-hover:brightness-125 group-hover:outline-2 group-hover:outline-yellow-500 group-hover:outline-offset-4 brightness-90">
            <Image
              src="/assets/images/crypto.webp"
              alt="Crypto"
              width={1920}
              height={1080}
              className="object-cover w-full h-full"
            />
          </div>

          <p className="font-bold">Crypto</p>
        </Link>
        <Link
          href="/crypto"
          className=" group rounded-2xl relative flex flex-col items-center justify-center gap-5 text-2xl hover:text-yellow-500 "
        >
          <div className="rounded-2xl overflow-hidden aspect-square w-full relative group-hover:scale-105 origin-bottom transition-transform  group-hover:brightness-125 group-hover:outline-2 group-hover:outline-yellow-500 group-hover:outline-offset-4 brightness-90 ">
            <Image
              src="/assets/images/stock.avif"
              alt="Stock"
              width={626}
              height={417}
              className="object-cover w-full h-full"
            />
          </div>

          <p className="font-bold">Stock</p>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
