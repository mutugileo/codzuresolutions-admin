import { getBusinessById } from "@/actions/businesses";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKES, formatNumber, formatDate } from "@/lib/formatters";
import { ShoppingCart, Package, Receipt, CalendarCheck, DollarSign, TrendingUp, Users, Smartphone, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getBusinessById(id);
  if (!detail) notFound();

  const { business, counts, financials, integrations } = detail;
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
        <StatCard title="Day Closures" value={formatNumber(counts.closures)} icon={CalendarCheck} />
        <StatCard title="Active Staff" value={formatNumber(counts.members)} icon={Users} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="STK Prompts Sent" value={formatNumber(counts.stkRequests)} icon={Smartphone} />
        <StatCard title="Expiring / Expired (30d)" value={formatNumber(counts.expiringProducts)} icon={AlertTriangle} />
        <StatCard title="Customer Deni (Credit)" value={formatKES(financials.totalCustomerCredit)} icon={DollarSign} />
        <StatCard title="Supplier Debts" value={formatKES(financials.totalSupplierDebt)} icon={Receipt} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Moat Integrations Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant={integrations.mpesaStkActive ? "default" : "secondary"}>
              M-Pesa STK Push: {integrations.mpesaStkActive ? `Active (${integrations.mpesaShortcode})` : "Not Active"}
            </Badge>
            <Badge variant={integrations.shopifyConnected ? "default" : "secondary"}>
              Shopify: {integrations.shopifyConnected ? integrations.shopifyDomain : "Not Connected"}
            </Badge>
            <Badge variant={integrations.etimsConnected ? "default" : "secondary"}>
              KRA eTIMS: {integrations.etimsConnected ? `Connected (${integrations.etimsKraPin})` : "Not Connected"}
            </Badge>
          </div>
        </CardContent>
      </Card>

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
