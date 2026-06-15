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

interface TrendPoint {
  key: string;
  label: string;
  rate: number;
}

export interface FeatureUsageItem {
  feature: string;
  businesses: number;
  rate: number;
}

export interface PaymentTrendPoint {
  key: string;
  label: string;
  successful: number;
  attempts: number;
  rate: number;
}

export interface GrowthReliabilityMetrics {
  activationRate: number;
  activationActivated: number;
  activationEligible: number;
  monthlyChurnRate: number;
  churnTrend: TrendPoint[];
  featureUsage: FeatureUsageItem[];
  paymentSuccessRate: number;
  paymentSuccessful: number;
  paymentAttempts: number;
  paymentPending: number;
  paymentTrend: PaymentTrendPoint[];
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export async function getGrowthReliabilityMetrics(): Promise<GrowthReliabilityMetrics> {
  const supabase = createAdminClient();
  const now = new Date();

  const activationLookback = new Date(now);
  activationLookback.setDate(activationLookback.getDate() - 30);

  const paymentLookback = new Date(now);
  paymentLookback.setDate(paymentLookback.getDate() - 30);

  const [
    businessesRes,
    salesRes,
    subscriptionsRes,
    paymentsRes,
    salesBizRes,
    expensesBizRes,
    productsBizRes,
    servicesBizRes,
    closuresBizRes,
  ] = await Promise.all([
    supabase.from("businesses").select("id, created_at"),
    supabase.from("sales").select("business_id, sale_date"),
    supabase.from("subscriptions").select("status, created_at, updated_at"),
    supabase
      .from("payments")
      .select("status, created_at")
      .gte("created_at", paymentLookback.toISOString())
      .order("created_at", { ascending: true }),
    supabase.from("sales").select("business_id"),
    supabase.from("expenses").select("business_id"),
    supabase.from("products").select("business_id"),
    supabase.from("service_definitions").select("business_id"),
    supabase.from("day_closures").select("business_id"),
  ]);

  const businesses = businessesRes.data || [];
  const sales = salesRes.data || [];
  const subscriptions = subscriptionsRes.data || [];
  const payments = paymentsRes.data || [];

  const firstSaleByBusiness = new Map<string, Date>();
  for (const sale of sales) {
    if (!sale.business_id || !sale.sale_date) continue;
    const saleDate = new Date(sale.sale_date);
    const known = firstSaleByBusiness.get(sale.business_id);
    if (!known || saleDate < known) {
      firstSaleByBusiness.set(sale.business_id, saleDate);
    }
  }

  const activationEligible = businesses.filter((biz) => {
    const createdAt = new Date(biz.created_at);
    return createdAt >= activationLookback;
  });

  const activationActivated = activationEligible.filter((biz) => {
    const createdAt = new Date(biz.created_at);
    const firstSale = firstSaleByBusiness.get(biz.id);
    if (!firstSale) return false;
    const activationDeadline = new Date(createdAt);
    activationDeadline.setDate(activationDeadline.getDate() + 14);
    return firstSale <= activationDeadline;
  }).length;

  const activationRate =
    activationEligible.length > 0
      ? clampRate((activationActivated / activationEligible.length) * 100)
      : 0;

  const churnStatuses = new Set(["CANCELED", "LOCKED", "PAST_DUE"]);
  const churnTrend: TrendPoint[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const monthCursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = getMonthStart(monthCursor);
    const monthEnd = getMonthEnd(monthCursor);

    const baseAtStart = subscriptions.filter((sub) => {
      if (!sub.created_at) return false;
      return new Date(sub.created_at) < monthStart;
    }).length;

    const churnEvents = subscriptions.filter((sub) => {
      if (!churnStatuses.has(sub.status)) return false;
      if (!sub.updated_at) return false;
      const updatedAt = new Date(sub.updated_at);
      return updatedAt >= monthStart && updatedAt <= monthEnd;
    }).length;

    const rate = baseAtStart > 0 ? (churnEvents / baseAtStart) * 100 : 0;

    churnTrend.push({
      key: `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`,
      label: monthCursor.toLocaleDateString("en-KE", { month: "short" }),
      rate: clampRate(rate),
    });
  }

  const monthlyChurnRate = churnTrend[churnTrend.length - 1]?.rate || 0;

  const totalBusinesses = businesses.length;

  const featureUsage: FeatureUsageItem[] = [
    { feature: "Sales", businesses: new Set((salesBizRes.data || []).map((r) => r.business_id).filter(Boolean)).size, rate: 0 },
    { feature: "Expenses", businesses: new Set((expensesBizRes.data || []).map((r) => r.business_id).filter(Boolean)).size, rate: 0 },
    { feature: "Inventory", businesses: new Set((productsBizRes.data || []).map((r) => r.business_id).filter(Boolean)).size, rate: 0 },
    { feature: "Services", businesses: new Set((servicesBizRes.data || []).map((r) => r.business_id).filter(Boolean)).size, rate: 0 },
    { feature: "Day Closure", businesses: new Set((closuresBizRes.data || []).map((r) => r.business_id).filter(Boolean)).size, rate: 0 },
  ].map((item) => ({
    ...item,
    rate: totalBusinesses > 0 ? clampRate((item.businesses / totalBusinesses) * 100) : 0,
  }));

  const paymentTrendMap = new Map<string, PaymentTrendPoint>();
  for (let i = 29; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const key = toDateKey(day);
    paymentTrendMap.set(key, {
      key,
      label: day.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
      successful: 0,
      attempts: 0,
      rate: 0,
    });
  }

  let paymentSuccessful = 0;
  let paymentAttempts = 0;
  let paymentPending = 0;

  for (const payment of payments) {
    if (!payment.created_at) continue;
    const key = toDateKey(new Date(payment.created_at));
    const point = paymentTrendMap.get(key);
    if (!point) continue;

    if (payment.status === "SUCCESS") {
      point.successful += 1;
      point.attempts += 1;
      paymentSuccessful += 1;
      paymentAttempts += 1;
    } else if (payment.status === "FAILED") {
      point.attempts += 1;
      paymentAttempts += 1;
    } else if (payment.status === "PENDING") {
      paymentPending += 1;
    }
  }

  const paymentTrend = Array.from(paymentTrendMap.values()).map((point) => ({
    ...point,
    rate: point.attempts > 0 ? clampRate((point.successful / point.attempts) * 100) : 0,
  }));

  const paymentSuccessRate =
    paymentAttempts > 0
      ? clampRate((paymentSuccessful / paymentAttempts) * 100)
      : 0;

  return {
    activationRate,
    activationActivated,
    activationEligible: activationEligible.length,
    monthlyChurnRate,
    churnTrend,
    featureUsage: featureUsage.sort((a, b) => b.rate - a.rate),
    paymentSuccessRate,
    paymentSuccessful,
    paymentAttempts,
    paymentPending,
    paymentTrend,
  };
}
