"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { PlatformOverview } from "@/types/database";

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const supabase = createAdminClient();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [
    businessesRes,
    subscriptionsRes,
    salesRes,
    paymentsRes,
    signupsTodayRes,
    signupsWeekRes,
    signupsMonthRes,
    dauRes,
    closuresTodayRes,
  ] = await Promise.all([
    supabase.from("businesses").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("status"),
    supabase
      .from("sales")
      .select("total_amount")
      .in("payment_status", ["PAID", "PARTIAL"]),
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "SUCCESS"),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthAgo.toISOString()),
    // DAU: unique business_ids with sales in last 24h
    supabase
      .from("sales")
      .select("business_id")
      .gte("sale_date", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()),
    // Closures today for ritual engagement
    supabase
      .from("day_closures")
      .select("business_id")
      .gte("created_at", todayStart.toISOString()),
  ]);

  const totalBusinesses = businessesRes.count || 0;

  const subscriptions = subscriptionsRes.data || [];
  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const trialingSubscriptions = subscriptions.filter((s) => s.status === "TRIALING").length;
  const lockedSubscriptions = subscriptions.filter((s) => s.status === "LOCKED").length;

  const totalSalesVolume = (salesRes.data || []).reduce(
    (sum, s) => sum + (Number(s.total_amount) || 0),
    0
  );

  const subscriptionRevenue = (paymentsRes.data || []).reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  // DAU: count unique business_ids
  const dauBusinessIds = new Set((dauRes.data || []).map((s) => s.business_id));
  const dau = dauBusinessIds.size;

  // Ritual engagement: businesses with closure today / active businesses
  const closureBusinessIds = new Set((closuresTodayRes.data || []).map((c) => c.business_id));
  const ritualEngagement = dau > 0 ? (closureBusinessIds.size / dau) * 100 : 0;

  // Conversion: paid / (paid + trialing) * 100
  const paidCount = activeSubscriptions;
  const totalTrialAndPaid = paidCount + trialingSubscriptions;
  const conversionRate = totalTrialAndPaid > 0 ? (paidCount / totalTrialAndPaid) * 100 : 0;

  return {
    totalBusinesses,
    activeSubscriptions,
    trialingSubscriptions,
    lockedSubscriptions,
    totalSalesVolume,
    subscriptionRevenue,
    signupsToday: signupsTodayRes.count || 0,
    signupsWeek: signupsWeekRes.count || 0,
    signupsMonth: signupsMonthRes.count || 0,
    dau,
    ritualEngagement,
    conversionRate,
  };
}

export interface SubscriptionDistItem {
  status: string;
  count: number;
  fill: string;
}

export async function getSubscriptionDistribution(): Promise<SubscriptionDistItem[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("subscriptions").select("status");

  const counts: Record<string, number> = {};
  (data || []).forEach((s) => {
    counts[s.status] = (counts[s.status] || 0) + 1;
  });

  const colors: Record<string, string> = {
    TRIALING: "hsl(210, 80%, 55%)",
    ACTIVE: "hsl(142, 70%, 45%)",
    PAST_DUE: "hsl(45, 90%, 50%)",
    GRACE_PERIOD: "hsl(30, 90%, 55%)",
    LOCKED: "hsl(0, 80%, 55%)",
    CANCELED: "hsl(0, 0%, 60%)",
  };

  return Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    fill: colors[status] || "hsl(0, 0%, 50%)",
  }));
}

export interface RevenueTrendItem {
  date: string;
  revenue: number;
}

export async function getRevenueTrend(days: number = 30): Promise<RevenueTrendItem[]> {
  const supabase = createAdminClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from("sales")
    .select("sale_date, total_amount")
    .in("payment_status", ["PAID", "PARTIAL"])
    .gte("sale_date", startDate.toISOString())
    .order("sale_date", { ascending: true });

  // Group by date
  const dailyRevenue: Record<string, number> = {};

  // Pre-fill all dates with 0
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyRevenue[key] = 0;
  }

  (data || []).forEach((sale) => {
    const date = new Date(sale.sale_date).toISOString().split("T")[0];
    dailyRevenue[date] = (dailyRevenue[date] || 0) + (Number(sale.total_amount) || 0);
  });

  return Object.entries(dailyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
}

export interface TopBusinessItem {
  id: string;
  business_name: string;
  category: string;
  owner_name: string;
  total_sales: number;
  sales_count: number;
  subscription_status: string;
}

export async function getTopBusinessesBySales(limit: number = 10): Promise<TopBusinessItem[]> {
  const supabase = createAdminClient();

  // Get all businesses with owners
  const { data: businesses } = await supabase
    .from("businesses")
    .select(`
      id,
      business_name,
      category,
      users!inner(full_name),
      subscriptions(status)
    `);

  if (!businesses || businesses.length === 0) return [];

  // Get sales totals per business
  const { data: sales } = await supabase
    .from("sales")
    .select("business_id, total_amount")
    .in("payment_status", ["PAID", "PARTIAL"]);

  const salesByBusiness: Record<string, { total: number; count: number }> = {};
  (sales || []).forEach((s) => {
    if (!salesByBusiness[s.business_id]) {
      salesByBusiness[s.business_id] = { total: 0, count: 0 };
    }
    salesByBusiness[s.business_id].total += Number(s.total_amount) || 0;
    salesByBusiness[s.business_id].count += 1;
  });

  return businesses
    .map((b) => ({
      id: b.id,
      business_name: b.business_name,
      category: b.category,
      owner_name: (b.users as unknown as { full_name: string })?.full_name || "Unknown",
      total_sales: salesByBusiness[b.id]?.total || 0,
      sales_count: salesByBusiness[b.id]?.count || 0,
      subscription_status: (b.subscriptions as unknown as { status: string }[])?.[0]?.status || "UNKNOWN",
    }))
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, limit);
}
