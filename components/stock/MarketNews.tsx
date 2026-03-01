import { getNews } from "@/lib/actions/finhub.actions";
import { formatTimeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NEWS_TABS = [
  { label: "Top stories", value: "Topstories" },
  //   { label: "Local markets", value: "Localmarkets" },
  //   { label: "World markets", value: "Worldmarkets" },
];

export default async function MarketNews() {
  const news = await getNews([""]);

  return (
    <div className="mx-auto w-full rounded-xl h-163 relative flex flex-col">
      <h3 className="font-semibold text-2xl text-gray-100 mb-5">Market News</h3>

      <Tabs
        defaultValue={NEWS_TABS[0].value}
        className="bg-neutral-900 rounded-lg px-2 py-4 flex flex-col relative flex-1 overflow-hidden"
      >
        {/* Pills */}
        <TabsList className="flex gap-2 pb-2 px-4! shrink-0 bg-transparent p-0">
          {NEWS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="
             px-4 py-1.5 rounded-full text-neutral-400! border-0 bg-neutral-700 hover:text-white! hover:bg-neutral-600!
                data-[state=active]:bg-neutral-600!
                data-[state=active]:text-white!
              "
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mx-4 my-1 h-px bg-gray-600" />

        {NEWS_TABS.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="flex-1 overflow-hidden mt-0 flex"
          >
            <MarketNewsList articles={news} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface Props {
  articles: MarketNewsArticle[];
}

function MarketNewsList({ articles }: Props) {
  return (
    <div className="flex-1 overflow-y-auto dark-scroll">
      {articles.map((article, index) => (
        <div key={article.url}>
          {index !== 0 && <div className="mx-4 my-1 h-px bg-gray-600" />}

          <Link
            href={article.url}
            target="_blank"
            className="flex justify-between p-4 hover:bg-neutral-800 transition rounded-lg m-1"
          >
            {/* Content */}
            <div className="flex flex-col">
              <p className="text-sm text-neutral-400 flex items-center gap-2">
                <span>{article.source}</span>
                <span className="text-lg leading-none">•</span>
                <span>{formatTimeAgo(article.datetime)}</span>
              </p>

              <h3 className="mt-1 line-clamp-2 font-medium">
                {article.headline}
              </h3>
            </div>

            {/* Thumbnail */}
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-neutral-800">
              {article.image && (
                <Image
                  src={article.image}
                  alt={article.headline}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
