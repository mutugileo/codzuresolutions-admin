import { getBusinessClosures } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatKES, formatDate } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BusinessClosuresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const closures = await getBusinessClosures(id);

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{closures.length} Day Closures</CardTitle>
        </CardHeader>
        <CardContent>
          {closures.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No day closures" description="Day closures appear when the business completes Funga Siku." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Expected Cash</TableHead>
                    <TableHead className="text-right">Actual Cash</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closures.map((closure) => {
                    const dateVal = closure.closed_date || closure.closure_date || closure.created_at;
                    const variance = Number(closure.variance) || 0;
                    return (
                    <TableRow key={closure.id}>
                      <TableCell className="font-medium">{formatDate(dateVal)}</TableCell>
                      <TableCell className="text-right text-sm">{formatKES(closure.total_sales || 0)}</TableCell>
                      <TableCell className="text-right text-sm">{formatKES(closure.total_expenses || 0)}</TableCell>
                      <TableCell className="text-right text-sm">{formatKES(closure.expected_cash || 0)}</TableCell>
                      <TableCell className="text-right text-sm">{formatKES(closure.actual_cash || 0)}</TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        variance < 0 ? "text-destructive" : variance > 0 ? "text-green-600" : ""
                      )}>
                        {variance > 0 ? "+" : ""}{formatKES(variance)}
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
