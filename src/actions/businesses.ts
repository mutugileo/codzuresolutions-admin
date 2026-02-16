"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { BusinessWithOwner, Sale, Product, Expense, DayClosure, ServiceDefinition, ServiceProvider, Customer, MpesaTransaction } from "@/types/database";

export interface BusinessListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  subscriptionStatus?: string;
}

export interface BusinessListResult {
  businesses: BusinessWithOwner[];
  total: number;
}

export async function getBusinesses(params: BusinessListParams = {}): Promise<BusinessListResult> {
  const { page = 0, pageSize = 20, search, category, subscriptionStatus } = params;
  const supabase = createAdminClient();

  let query = supabase
    .from("businesses")
    .select(
      `*, users!inner(id, full_name, email, phone), subscriptions(id, status, plan_type, trial_end, current_period_end)`,
      { count: "exact" }
    );

  if (search) {
    query = query.ilike("business_name", `%${search}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching businesses:", error);
    return { businesses: [], total: 0 };
  }

  let businesses = (data || []) as unknown as BusinessWithOwner[];

  // Client-side filter by subscription status since it's in a joined table
  if (subscriptionStatus) {
    businesses = businesses.filter((b) => {
      const sub = b.subscriptions?.[0];
      return sub?.status === subscriptionStatus;
    });
  }

  return { businesses, total: count || 0 };
}

export interface BusinessDetail {
  business: BusinessWithOwner;
  counts: {
    sales: number;
    products: number;
    expenses: number;
    services: number;
    providers: number;
    closures: number;
  };
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
  };
}

export async function getBusinessById(id: string): Promise<BusinessDetail | null> {
  const supabase = createAdminClient();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `*, users!inner(id, full_name, email, phone), subscriptions(*)`
    )
    .eq("id", id)
    .single();

  if (error || !business) return null;

  const [salesRes, productsRes, expensesRes, servicesRes, providersRes, closuresRes, revRes, expTotalRes] =
    await Promise.all([
      supabase.from("sales").select("*", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("expenses").select("*", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("service_definitions").select("*", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("service_providers").select("*", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("day_closures").select("*", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("sales").select("total_amount").eq("business_id", id).in("payment_status", ["PAID", "PARTIAL"]),
      supabase.from("expenses").select("amount").eq("business_id", id),
    ]);

  const totalRevenue = (revRes.data || []).reduce((s, r) => s + (Number(r.total_amount) || 0), 0);
  const totalExpenses = (expTotalRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return {
    business: business as unknown as BusinessWithOwner,
    counts: {
      sales: salesRes.count || 0,
      products: productsRes.count || 0,
      expenses: expensesRes.count || 0,
      services: servicesRes.count || 0,
      providers: providersRes.count || 0,
      closures: closuresRes.count || 0,
    },
    financials: {
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
    },
  };
}

export async function getBusinessSales(businessId: string, page = 0, pageSize = 20) {
  const supabase = createAdminClient();
  const { data, count } = await supabase
    .from("sales")
    .select("*", { count: "exact" })
    .eq("business_id", businessId)
    .order("sale_date", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  return { sales: (data || []) as Sale[], total: count || 0 };
}

export async function getBusinessProducts(businessId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("name");
  return (data || []) as Product[];
}

export async function getBusinessExpenses(businessId: string, page = 0, pageSize = 20) {
  const supabase = createAdminClient();
  const { data, count } = await supabase
    .from("expenses")
    .select("*", { count: "exact" })
    .eq("business_id", businessId)
    .order("expense_date", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  return { expenses: (data || []) as Expense[], total: count || 0 };
}

export async function getBusinessClosures(businessId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("day_closures")
    .select("*")
    .eq("business_id", businessId)
    .order("closure_date", { ascending: false });
  return (data || []) as DayClosure[];
}

export async function getBusinessServices(businessId: string) {
  const supabase = createAdminClient();
  const [servicesRes, providersRes] = await Promise.all([
    supabase.from("service_definitions").select("*").eq("business_id", businessId).order("name"),
    supabase.from("service_providers").select("*").eq("business_id", businessId).order("full_name"),
  ]);
  return {
    services: (servicesRes.data || []) as ServiceDefinition[],
    providers: (providersRes.data || []) as ServiceProvider[],
  };
}

export async function getBusinessCustomers(businessId: string) {
  const supabase = createAdminClient();
  try {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .order("total_spent", { ascending: false });
    return (data || []) as Customer[];
  } catch {
    return [] as Customer[];
  }
}

export async function getBusinessMpesa(businessId: string) {
  const supabase = createAdminClient();
  try {
    const { data } = await supabase
      .from("mpesa_transactions")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    return (data || []) as MpesaTransaction[];
  } catch {
    return [] as MpesaTransaction[];
  }
}
