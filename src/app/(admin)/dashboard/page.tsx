import { Suspense } from "react";
import { getPlatformOverview, getSubscriptionDistribution, getRevenueTrend, getTopBusinessesBySales } from "@/actions/analytics";
import { StatCard } from "@/components/dashboard/stat-card";
import { SubscriptionPie } from "@/components/dashboard/subscription-pie";
import { RevenueTrendChart } from "@/components/dashboard/revenue-chart";
import { TopBusinesses } from "@/components/dashboard/top-businesses";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, TrendingUp, CalendarCheck } from "lucide-react";
import { formatKES, formatPercent, formatNumber } from "@/lib/formatters";

async function DashboardContent() {
  const [overview, subscriptionDist, revenueTrend, topBusinesses] = await Promise.all([
    getPlatformOverview(),
    getSubscriptionDistribution(),
    getRevenueTrend(30),
    getTopBusinessesBySales(10),
  ]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Businesses"
          value={formatNumber(overview.totalBusinesses)}
          description={`${overview.signupsWeek} this week`}
          icon={Building2}
        />
        <StatCard
          title="Active Subscriptions"
          value={formatNumber(overview.activeSubscriptions)}
          description={`${overview.trialingSubscriptions} trialing`}
          icon={Users}
        />
        <StatCard
          title="Total Sales Volume"
          value={formatKES(overview.totalSalesVolume)}
          description="Across all businesses"
          icon={TrendingUp}
        />
        <StatCard
          title="Funga Siku Rate"
          value={formatPercent(overview.ritualEngagement)}
          description={`DAU: ${overview.dau} businesses`}
          icon={CalendarCheck}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={revenueTrend} />
        </div>
        <div>
          <SubscriptionPie data={subscriptionDist} />
        </div>
      </div>

      <div className="mt-6">
        <TopBusinesses businesses={topBusinesses} />
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      <Skeleton className="mt-6 h-64 rounded-lg" />
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Platform Overview</h1>
      <p className="text-muted-foreground">Monitor health, growth, and reliability across all NeoBuk businesses.</p>
      <div className="pt-4">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
