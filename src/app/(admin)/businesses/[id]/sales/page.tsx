import { getBusinessSales } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatDateTime } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { ShoppingCart } from "lucide-react";

export default async function BusinessSalesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sales, total } = await getBusinessSales(id, 0, 50);

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{total} Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="No sales recorded" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">{sale.sale_number || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(sale.sale_date)}</TableCell>
                      <TableCell><Badge variant="outline">{sale.sale_type}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{formatKES(sale.total_amount)}</TableCell>
                      <TableCell className="text-sm">{sale.payment_method}</TableCell>
                      <TableCell>
                        <Badge variant={sale.payment_status === "PAID" ? "default" : "secondary"}>
                          {sale.payment_status}
                        </Badge>
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
