import { getBusinessCustomers } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatNumber } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default async function BusinessCustomersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customers = await getBusinessCustomers(id);

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{customers.length} Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <EmptyState icon={Users} title="No customers" description="Customer data may not be available yet." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Credit Balance</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((cust) => (
                    <TableRow key={cust.id}>
                      <TableCell className="font-medium">{cust.name}</TableCell>
                      <TableCell className="text-sm">{cust.phone || "-"}</TableCell>
                      <TableCell className="text-right text-sm">{formatKES(cust.total_spent)}</TableCell>
                      <TableCell className="text-right text-sm">{formatNumber(cust.total_transactions)}</TableCell>
                      <TableCell className="text-right">
                        {cust.credit_balance > 0 ? (
                          <Badge variant="destructive">{formatKES(cust.credit_balance)}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{cust.source}</Badge>
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
