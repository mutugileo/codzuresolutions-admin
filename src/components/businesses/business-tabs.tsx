"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview", href: "" },
  { label: "Sales", href: "/sales" },
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Customers", href: "/customers" },
  { label: "Expenses", href: "/expenses" },
  { label: "Day Closures", href: "/closures" },
  { label: "M-Pesa", href: "/mpesa" },
];

export function BusinessTabs({ businessId }: { businessId: string }) {
  const pathname = usePathname();
  const basePath = `/businesses/${businessId}`;

  return (
    <div className="border-b border-border overflow-x-auto">
      <nav className="flex gap-0 -mb-px min-w-max">
        {tabs.map((tab) => {
          const fullHref = `${basePath}${tab.href}`;
          const isActive = tab.href === ""
            ? pathname === basePath
            : pathname.startsWith(fullHref);

          return (
            <Link
              key={tab.href}
              href={fullHref}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
