import { getBusinessEtims } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ETIMS_STATUS_COLORS } from "@/lib/constants";
import { formatKES, formatDateTime } from "@/lib/formatters";
import { ShieldCheck } from "lucide-react";

export default async function BusinessEtimsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { connection, invoices } = await getBusinessEtims(id);

  return (
    <div className="pt-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">KRA eTIMS (OSCU) Connection</CardTitle>
        </CardHeader>
        <CardContent>
          {!connection ? (
            <EmptyState
              icon={ShieldCheck}
              title="Not initialized"
              description="This business has not initialized a KRA eTIMS OSCU device yet."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={
                    connection.is_connected
                      ? "mt-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "mt-1 bg-red-500/10 text-red-400 border-red-500/20"
                  }
                >
                  {connection.is_connected ? "Connected" : "Disconnected"} &middot; {connection.environment.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">KRA PIN / Branch</p>
                <p className="font-medium mt-1">
                  {connection.kra_pin} (Branch {connection.bhf_id})
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Device Serial / SDC</p>
                <p className="font-medium mt-1">
                  {connection.device_serial} {connection.sdc_id ? `(${connection.sdc_id})` : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Synced</p>
                <p className="font-medium mt-1">
                  {connection.last_synced_at ? formatDateTime(connection.last_synced_at) : "Never"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{invoices.length} Fiscal Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No eTIMS invoices"
              description="Fiscal invoices appear here once sales are submitted to KRA eTIMS."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>CU Invoice No</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.cu_invoice_number || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ETIMS_STATUS_COLORS[inv.status] || ""}>
                          {inv.status.toUpperCase()}
                        </Badge>
                        {inv.error_message && inv.status !== "submitted" && (
                          <p className="text-xs text-destructive mt-1 max-w-xs truncate" title={inv.error_message}>
                            {inv.error_message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatKES(inv.taxable_amount)}</TableCell>
                      <TableCell className="text-right text-sm">{formatKES(inv.tax_amount)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatKES(inv.total_amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(inv.created_at)}
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
