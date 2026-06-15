import { Suspense } from "react";
import { getRevenueTrend, getPlatformOverview } from "@/actions/analytics";
import {
  getGrowthReliabilityMetrics,
  getPaymentMethodStats,
  getTopProducts,
} from "@/actions/analytics-extended";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueTrendChart } from "@/components/dashboard/revenue-chart";
import { PaymentMethodChart } from "@/components/analytics/payment-method-chart";
import { TopProductsChart } from "@/components/analytics/top-products-chart";
import { GrowthReliabilitySection } from "@/components/analytics/growth-reliability-section";
import { formatKES, formatNumber, formatPercent } from "@/lib/formatters";
import { ShoppingCart, TrendingUp, Users, Target } from "lucide-react";

async function AnalyticsContent() {
  const [overview, revenueTrend, paymentMethods, topProducts, growthReliability] = await Promise.all([
    getPlatformOverview(),
    getRevenueTrend(30),
    getPaymentMethodStats(),
    getTopProducts(10),
    getGrowthReliabilityMetrics(),
  ]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sales Volume" value={formatKES(overview.totalSalesVolume)} icon={TrendingUp} />
        <StatCard title="DAU" value={formatNumber(overview.dau)} description="Active businesses today" icon={Users} />
        <StatCard title="Conversion Rate" value={formatPercent(overview.conversionRate)} description="Trial to Paid" icon={Target} />
        <StatCard title="Funga Siku" value={formatPercent(overview.ritualEngagement)} description="Day closure rate" icon={ShoppingCart} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RevenueTrendChart data={revenueTrend} />
        <PaymentMethodChart data={paymentMethods} />
      </div>

      <div className="mt-6">
        <TopProductsChart data={topProducts} />
      </div>

      <GrowthReliabilitySection data={growthReliability} />
    </>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Cross-platform sales and engagement analytics.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
