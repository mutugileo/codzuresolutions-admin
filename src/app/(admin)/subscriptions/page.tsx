import { Suspense } from "react";
import { getSubscriptionsWithBusinesses } from "@/actions/subscriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_PLANS } from "@/lib/constants";
import { formatKES, formatUSD, formatCurrencyAmount, kesToUsd, formatDate, formatNumber } from "@/lib/formatters";
import { CreditCard, Users, Lock, TrendingUp } from "lucide-react";
import { SubscriptionActions } from "@/components/subscriptions/subscription-actions";

async function SubscriptionContent() {
  const subscriptions = await getSubscriptionsWithBusinesses();

  const active = subscriptions.filter((s) => s.status === "ACTIVE");
  const trialing = subscriptions.filter((s) => s.status === "TRIALING");
  const locked = subscriptions.filter((s) => s.status === "LOCKED");

  const mrr = active.reduce((sum, s) => {
    const plan = SUBSCRIPTION_PLANS[s.plan_type as keyof typeof SUBSCRIPTION_PLANS];
    return sum + (plan?.monthlyEquivalentKes ?? 0);
  }, 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active" value={formatNumber(active.length)} icon={CreditCard} />
        <StatCard title="Trialing" value={formatNumber(trialing.length)} icon={Users} />
        <StatCard title="Locked" value={formatNumber(locked.length)} icon={Lock} />
        <StatCard title="MRR" value={formatKES(mrr)} description={`${formatUSD(kesToUsd(mrr))} / mo`} icon={TrendingUp} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{subscriptions.length} Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => {
                  const biz = sub.businesses as unknown as {
                    id: string;
                    business_name: string;
                    category: string;
                    users: { full_name: string; phone: string };
                  };
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{biz?.business_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {biz?.users?.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {SUBSCRIPTION_PLANS[sub.plan_type as keyof typeof SUBSCRIPTION_PLANS]?.name || sub.plan_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={SUBSCRIPTION_STATUS_COLORS[sub.status] || ""}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatCurrencyAmount(sub.price, sub.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(sub.current_period_end)}
                      </TableCell>
                      <TableCell className="text-right">
                        <SubscriptionActions
                          subscriptionId={sub.id}
                          currentStatus={sub.status}
                          currentPlan={sub.plan_type}
                          trialEnd={sub.trial_end}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage subscription plans and billing.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <SubscriptionContent />
      </Suspense>
    </div>
  );
}
