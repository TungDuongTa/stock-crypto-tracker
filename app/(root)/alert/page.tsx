import AlertsList from "@/components/AlertsList";
import { Button } from "@/components/ui/button";
import { getUserAlerts } from "@/lib/actions/alert.actions";
import Link from "next/link";
import { Bell } from "lucide-react";

export default async function AlertsPage() {
  const alerts = await getUserAlerts();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-100">Price Alerts</h1>
        </div>
        <Link href="/watchlist">
          <Button className="yellow-btn">Back to Watchlist</Button>
        </Link>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <AlertsList alertData={alerts} />
      </div>
    </section>
  );
}
