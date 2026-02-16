import { Suspense } from "react";
import { getBusinesses } from "@/actions/businesses";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SUBSCRIPTION_STATUS_COLORS, BUSINESS_CATEGORY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2 } from "lucide-react";
import Link from "next/link";

async function BusinessList() {
  const { businesses, total } = await getBusinesses({ pageSize: 50 });

  if (businesses.length === 0) {
    return <EmptyState icon={Building2} title="No businesses yet" description="Businesses will appear here when users sign up." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{total} Businesses</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((biz) => {
              const sub = biz.subscriptions?.[0];
              return (
                <TableRow key={biz.id}>
                  <TableCell>
                    <Link href={`/businesses/${biz.id}`} className="font-medium hover:underline">
                      {biz.business_name}
                    </Link>
                    {biz.subtype && (
                      <span className="text-xs text-muted-foreground ml-2">{biz.subtype}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={BUSINESS_CATEGORY_COLORS[biz.category] || ""}>
                      {biz.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{biz.users?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{biz.users?.phone}</div>
                  </TableCell>
                  <TableCell>
                    {sub ? (
                      <Badge variant="secondary" className={SUBSCRIPTION_STATUS_COLORS[sub.status] || ""}>
                        {sub.status}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(biz.created_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function BusinessesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Businesses</h1>
        <p className="text-muted-foreground">View and manage all registered businesses.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <BusinessList />
      </Suspense>
    </div>
  );
}
