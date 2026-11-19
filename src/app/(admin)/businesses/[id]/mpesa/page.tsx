import { getBusinessMpesa } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { STK_STATUS_COLORS } from "@/lib/constants";
import { formatKES, formatDateTime } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { Smartphone } from "lucide-react";

export default async function BusinessMpesaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { transactions, stkConfig, stkRequests } = await getBusinessMpesa(id);

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Daraja STK Push at Checkout</CardTitle>
          <Badge variant={stkConfig?.is_active ? "default" : "secondary"}>
            {stkConfig
              ? stkConfig.is_active
                ? `Active · ${stkConfig.environment}`
                : "Paused"
              : "Not Configured"}
          </Badge>
        </CardHeader>
        <CardContent>
          {!stkConfig ? (
            <p className="text-sm text-muted-foreground">
              Owner has not connected a Paybill or Buy Goods Till for counter STK Push yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Channel</p>
                <p className="font-medium">
                  {stkConfig.transaction_type === "CustomerBuyGoodsOnline" ? "Buy Goods (Till)" : "Paybill"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Shortcode / Till</p>
                <p className="font-medium font-mono">
                  {stkConfig.till_number || stkConfig.shortcode}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Environment</p>
                <p className="font-medium capitalize">{stkConfig.environment}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Verified</p>
                <p className="font-medium">
                  {stkConfig.last_verified_at ? formatDateTime(stkConfig.last_verified_at) : "-"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{stkRequests.length} Checkout STK Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {stkRequests.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title="No checkout STK prompts yet"
              description="Live counter STK Push prompts initiated by this business will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>M-Pesa Receipt</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stkRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">{req.phone}</TableCell>
                      <TableCell className="text-right font-medium">{formatKES(req.amount_kes)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STK_STATUS_COLORS[req.status] || ""}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {req.mpesa_receipt_number || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">
                        {req.result_desc || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(req.created_at)}
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
          <CardTitle className="text-base">{transactions.length} M-Pesa Transactions (SMS / Manual)</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState icon={Smartphone} title="No M-Pesa transactions" description="M-Pesa data may not be available yet." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{tx.transaction_code || "-"}</TableCell>
                      <TableCell className="text-sm">{tx.transaction_type || "-"}</TableCell>
                      <TableCell className="text-right font-medium">{formatKES(tx.amount)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{tx.customer_name || "-"}</div>
                        <div className="text-xs text-muted-foreground">{tx.customer_phone || ""}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          tx.status === "CONFIRMED" ? "default" :
                          tx.status === "PENDING" ? "secondary" : "outline"
                        }>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.transaction_date ? formatDateTime(tx.transaction_date) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
