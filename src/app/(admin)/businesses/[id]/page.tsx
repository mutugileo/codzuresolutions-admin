import { getBusinessById } from "@/actions/businesses";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKES, formatNumber, formatDate } from "@/lib/formatters";
import { ShoppingCart, Package, Receipt, CalendarCheck, DollarSign, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getBusinessById(id);
  if (!detail) notFound();

  const { business, counts, financials } = detail;
  const sub = business.subscriptions?.[0];

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Revenue" value={formatKES(financials.totalRevenue)} icon={TrendingUp} />
        <StatCard title="Total Expenses" value={formatKES(financials.totalExpenses)} icon={Receipt} />
        <StatCard title="Net Profit" value={formatKES(financials.profit)} icon={DollarSign} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Sales" value={formatNumber(counts.sales)} icon={ShoppingCart} />
        <StatCard title="Products" value={formatNumber(counts.products)} icon={Package} />
        <StatCard title="Expenses" value={formatNumber(counts.expenses)} icon={Receipt} />
        <StatCard title="Day Closures" value={formatNumber(counts.closures)} icon={CalendarCheck} />
      </div>

      {sub && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Plan</p>
                <p className="font-medium">{sub.plan_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">{sub.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trial End</p>
                <p className="font-medium">{sub.trial_end ? formatDate(sub.trial_end) : "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Period End</p>
                <p className="font-medium">{formatDate(sub.current_period_end)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Owner</p>
              <p className="font-medium">{business.users?.full_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{business.users?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{business.users?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{business.category}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Subtype</p>
              <p className="font-medium">{business.subtype || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Registered</p>
              <p className="font-medium">{formatDate(business.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
