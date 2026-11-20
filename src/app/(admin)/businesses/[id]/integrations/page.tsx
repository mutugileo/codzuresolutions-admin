import { getBusinessIntegrations } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { KraEtimsMark, MpesaMark, ShopifyMark } from "@/components/shared/brand-marks";
import { formatDateTime, formatKES, formatNumber } from "@/lib/formatters";
import { Users, Receipt } from "lucide-react";

export default async function BusinessIntegrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { shopify, shopifyLinksCount, mpesaStk, etims, members, supplierDebts } =
    await getBusinessIntegrations(id);

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShopifyMark className="h-4 w-4" />
              Shopify Omnichannel
            </CardTitle>
            <Badge variant={shopify && shopify.status !== "disconnected" ? "default" : "secondary"}>
              {shopify?.status || "Not Connected"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Store: </span>
              <span className="font-medium">{shopify?.shop_domain || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Linked Products: </span>
              <span className="font-medium">{formatNumber(shopifyLinksCount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Synced: </span>
              <span className="font-medium">
                {shopify?.last_synced_at ? formatDateTime(shopify.last_synced_at) : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MpesaMark className="h-4 w-4" />
              M-Pesa STK (Daraja)
            </CardTitle>
            <Badge variant={mpesaStk?.is_active ? "default" : "secondary"}>
              {mpesaStk ? (mpesaStk.is_active ? "Active" : "Paused") : "Not Configured"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Channel: </span>
              <span className="font-medium">
                {mpesaStk
                  ? mpesaStk.transaction_type === "CustomerBuyGoodsOnline"
                    ? "Buy Goods (Till)"
                    : "Paybill"
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Shortcode / Till: </span>
              <span className="font-medium font-mono">
                {mpesaStk ? mpesaStk.till_number || mpesaStk.shortcode : "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Environment: </span>
              <span className="font-medium capitalize">{mpesaStk?.environment || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <KraEtimsMark className="h-4 w-4" />
              KRA eTIMS (OSCU)
            </CardTitle>
            <Badge variant={etims?.is_connected ? "default" : "secondary"}>
              {etims?.is_connected ? "Connected" : "Not Connected"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">KRA PIN: </span>
              <span className="font-medium font-mono">{etims?.kra_pin || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Branch / Device: </span>
              <span className="font-medium">
                {etims ? `${etims.bhf_id} · ${etims.device_serial}` : "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Environment: </span>
              <span className="font-medium capitalize">{etims?.environment || "-"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{members.length} Staff & Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <EmptyState icon={Users} title="No staff invited" description="Owner-only shop." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.display_name || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.invited_email}</TableCell>
                      <TableCell className="capitalize text-sm">{m.role}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === "active" ? "default" : "secondary"}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(m.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{supplierDebts.length} Supplier Debts</CardTitle>
        </CardHeader>
        <CardContent>
          {supplierDebts.length === 0 ? (
            <EmptyState icon={Receipt} title="No supplier debts recorded" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Owed</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierDebts.map((debt) => {
                    const balance = Math.max(0, Number(debt.amount_owed) - Number(debt.amount_paid));
                    return (
                      <TableRow key={debt.id}>
                        <TableCell className="font-medium">{debt.supplier_name}</TableCell>
                        <TableCell className="text-right text-sm">{formatKES(debt.amount_owed)}</TableCell>
                        <TableCell className="text-right text-sm">{formatKES(debt.amount_paid)}</TableCell>
                        <TableCell className="text-right font-medium">{formatKES(balance)}</TableCell>
                        <TableCell>
                          <Badge variant={balance === 0 ? "default" : "secondary"}>
                            {debt.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
