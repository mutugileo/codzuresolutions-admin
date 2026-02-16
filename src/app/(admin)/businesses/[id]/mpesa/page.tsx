import { getBusinessMpesa } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatDateTime } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { Smartphone } from "lucide-react";

export default async function BusinessMpesaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transactions = await getBusinessMpesa(id);

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{transactions.length} M-Pesa Transactions</CardTitle>
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
