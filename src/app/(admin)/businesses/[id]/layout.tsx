import { getBusinessById } from "@/actions/businesses";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_STATUS_COLORS, BUSINESS_CATEGORY_COLORS } from "@/lib/constants";
import { BusinessTabs } from "@/components/businesses/business-tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BusinessDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getBusinessById(id);

  if (!detail) {
    notFound();
  }

  const { business } = detail;
  const sub = business.subscriptions?.[0];

  return (
    <div className="space-y-4">
      <Link href="/businesses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Businesses
      </Link>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{business.business_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className={BUSINESS_CATEGORY_COLORS[business.category] || ""}>
              {business.category}
            </Badge>
            {business.subtype && (
              <span className="text-sm text-muted-foreground">{business.subtype}</span>
            )}
            <span className="text-sm text-muted-foreground">by {business.users?.full_name}</span>
          </div>
        </div>
        {sub && (
          <Badge variant="secondary" className={`text-sm ${SUBSCRIPTION_STATUS_COLORS[sub.status] || ""}`}>
            {sub.plan_type} &middot; {sub.status}
          </Badge>
        )}
      </div>
      <BusinessTabs businessId={id} />
      {children}
    </div>
  );
}
