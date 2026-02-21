export default function MarketNewsSkeleton() {
  return (
    <div className="mx-auto w-full rounded-xl h-163 flex flex-col">
      <h3 className="font-semibold text-2xl text-gray-100 mb-5">Market News</h3>

      <div className="bg-neutral-900 rounded-lg px-2 py-4 flex-1 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between p-4 animate-pulse">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-neutral-700 rounded" />
              <div className="h-4 w-60 bg-neutral-700 rounded" />
            </div>

            <div className="h-20 w-32 bg-neutral-700 rounded-md bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
