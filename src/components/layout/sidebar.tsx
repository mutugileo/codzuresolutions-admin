"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Businesses", href: "/businesses", icon: Building2 },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-[#0D0D0D]">
      <div className="flex h-14 items-center border-b border-[rgba(255,255,255,0.08)] px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-[#C8FF00]" />
          NeoBuk
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#C8FF00]/10 text-[#C8FF00]"
                : "text-[#888] hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("h-4 w-4 stroke-[1.5]", isActive ? "text-[#C8FF00]" : "text-[#888]")} />
            {item.label}
          </Link>
          );
        })}
      </nav>
    </aside>
  );
}
