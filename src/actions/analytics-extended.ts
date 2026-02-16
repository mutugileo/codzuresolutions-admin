"use server";

import { createAdminClient } from "@/lib/supabase/server";

export interface PaymentMethodItem {
  method: string;
  count: number;
  total: number;
  fill: string;
}

export async function getPaymentMethodStats(): Promise<PaymentMethodItem[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sales")
    .select("payment_method, total_amount")
    .in("payment_status", ["PAID", "PARTIAL"]);

  const stats: Record<string, { count: number; total: number }> = {};
  (data || []).forEach((s) => {
    const method = s.payment_method || "Unknown";
    if (!stats[method]) stats[method] = { count: 0, total: 0 };
    stats[method].count += 1;
    stats[method].total += Number(s.total_amount) || 0;
  });

  const colors: Record<string, string> = {
    Cash: "hsl(var(--chart-1))",
    "M-PESA": "hsl(var(--chart-2))",
    Card: "hsl(var(--chart-3))",
    Credit: "hsl(var(--chart-4))",
    "Bank Transfer": "hsl(var(--chart-5))",
  };

  return Object.entries(stats)
    .map(([method, { count, total }]) => ({
      method,
      count,
      total,
      fill: colors[method] || "hsl(var(--muted-foreground))",
    }))
    .sort((a, b) => b.total - a.total);
}

export interface TopProductItem {
  name: string;
  units_sold: number;
  revenue: number;
}

export async function getTopProducts(limit: number = 10): Promise<TopProductItem[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sale_items")
    .select("product_name, quantity, total_price")
    .eq("item_type", "PRODUCT")
    .not("product_name", "is", null);

  const productStats: Record<string, { units: number; revenue: number }> = {};
  (data || []).forEach((item) => {
    const name = item.product_name || "Unknown";
    if (!productStats[name]) productStats[name] = { units: 0, revenue: 0 };
    productStats[name].units += Number(item.quantity) || 0;
    productStats[name].revenue += Number(item.total_price) || 0;
  });

  return Object.entries(productStats)
    .map(([name, { units, revenue }]) => ({
      name,
      units_sold: Math.round(units),
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
