import { getBusinessExpenses } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatKES, formatDate } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { Receipt } from "lucide-react";

export default async function BusinessExpensesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { expenses, total } = await getBusinessExpenses(id, 0, 50);

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{total} Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <EmptyState icon={Receipt} title="No expenses recorded" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-medium">{exp.title}</TableCell>
                      <TableCell className="text-right font-medium">{formatKES(exp.amount)}</TableCell>
                      <TableCell className="text-sm">{exp.payment_method || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(exp.expense_date)}</TableCell>
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
