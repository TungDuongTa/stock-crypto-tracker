import Link from "next/link";
import React from "react";

function HomePage() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Link href="/stock">Stock</Link>
      <Link href="/crypto">Crypto</Link>
    </div>
  );
}

export default HomePage;
