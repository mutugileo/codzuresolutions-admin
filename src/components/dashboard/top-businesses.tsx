import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatNumber } from "@/lib/formatters";
import { SUBSCRIPTION_STATUS_COLORS, BUSINESS_CATEGORY_COLORS } from "@/lib/constants";
import type { TopBusinessItem } from "@/actions/analytics";
import Link from "next/link";

interface TopBusinessesProps {
  businesses: TopBusinessItem[];
}

export function TopBusinesses({ businesses }: TopBusinessesProps) {
  return (
    <Card>
      <CardHeader>
        <span className="section-header">Top Businesses by Sales</span>
      </CardHeader>
      <CardContent>
        {businesses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((biz, index) => (
                <TableRow key={biz.id}>
                  <TableCell className="text-[#888]">{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/businesses/${biz.id}`}
                      className="font-medium text-white hover:text-[#C8FF00] transition-colors"
                    >
                      {biz.business_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={BUSINESS_CATEGORY_COLORS[biz.category] || ""}
                    >
                      {biz.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#888]">
                    {biz.owner_name}
                  </TableCell>
                  <TableCell className="text-right font-medium text-white">
                    {formatKES(biz.total_sales)}
                  </TableCell>
                  <TableCell className="text-right text-[#888]">
                    {formatNumber(biz.sales_count)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={SUBSCRIPTION_STATUS_COLORS[biz.subscription_status] || ""}
                    >
                      {biz.subscription_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-32 items-center justify-center text-[#888]">
            No business data yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
