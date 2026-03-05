import React from "react";

import { cn } from "@/lib/utils";
import { DataTable } from "../DataTable";

export const TrendingCoinsFallback = () => {
  const columns = [
    {
      header: "Name",
      cell: () => (
        <div className="name-link">
          <div className="name-image bg-neutral-900/60" />
          <div className="name-line bg-neutral-900/60" />
        </div>
      ),
    },
    {
      header: "24h Change",
      cell: () => (
        <div className="price-change">
          <div className="change-icon bg-neutral-900/60" />
          <div className="change-line bg-neutral-900/60" />
        </div>
      ),
    },
    {
      header: "Price",
      cell: () => <div className="price-line bg-neutral-900/60" />,
    },
  ];

  const dummyData = Array.from({ length: 6 }, (_, i) => ({ id: i }));

  return (
    <div id="trending-coins-fallback">
      <h4>Trending Coins</h4>
      <DataTable
        data={dummyData}
        columns={columns as any}
        rowKey={(item: any) => item.id}
        tableClassName="trending-coins-table"
      />
    </div>
  );
};
