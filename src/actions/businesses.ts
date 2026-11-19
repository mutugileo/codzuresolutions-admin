"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/actions/auth";
import type {
  BusinessMember,
  BusinessWithOwner,
  CheckoutStkRequest,
  Customer,
  DayClosure,
  EtimsConnection,
  EtimsInvoice,
  Expense,
  MpesaMerchantConnection,
  MpesaTransaction,
  Product,
  Sale,
  ServiceDefinition,
  ServiceProvider,
  ShopifyConnection,
  SupplierDebt,
} from "@/types/database";

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
  await requireAdmin();
  const { page = 0, pageSize = 20, search, category, subscriptionStatus } = params;
  const supabase = createAdminClient();

  const subJoin = subscriptionStatus
    ? "subscriptions!inner(id, status, plan_type, trial_end, current_period_end)"
    : "subscriptions(id, status, plan_type, trial_end, current_period_end)";

  let query = supabase
    .from("businesses")
    .select(
      `*, users!inner(id, full_name, email, phone), ${subJoin}`,
      { count: "exact" }
    );

  if (search) {
    query = query.ilike("business_name", `%${search}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (subscriptionStatus) {
    query = query.eq("subscriptions.status", subscriptionStatus);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching businesses:", error);
    return { businesses: [], total: 0 };
  }

  return {
    businesses: (data || []) as unknown as BusinessWithOwner[],
    total: count || 0,
  };
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
    members: number;
    stkRequests: number;
    expiringProducts: number;
  };
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
    totalCustomerCredit: number;
    totalSupplierDebt: number;
  };
  integrations: {
    shopifyConnected: boolean;
    shopifyDomain: string | null;
    mpesaStkActive: boolean;
    mpesaShortcode: string | null;
    etimsConnected: boolean;
    etimsKraPin: string | null;
  };
}

export async function getBusinessById(id: string): Promise<BusinessDetail | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `*, users!inner(id, full_name, email, phone), subscriptions(*)`
    )
    .eq("id", id)
    .single();

  if (error || !business) return null;

  const soonCutoff = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [
    salesRes,
    productsRes,
    expensesRes,
    servicesRes,
    providersRes,
    closuresRes,
    revRes,
    expTotalRes,
    membersRes,
    stkCountRes,
    expiringRes,
    customersCreditRes,
    supplierDebtsRes,
    shopifyRes,
    mpesaConnRes,
    etimsConnRes,
  ] = await Promise.all([
    supabase.from("sales").select("*", { count: "exact", head: true }).eq("business_id", id),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("business_id", id),
    supabase.from("expenses").select("*", { count: "exact", head: true }).eq("business_id", id),
    supabase.from("service_definitions").select("*", { count: "exact", head: true }).eq("business_id", id),
    supabase.from("service_providers").select("*", { count: "exact", head: true }).eq("business_id", id),
    supabase.from("day_closures").select("*", { count: "exact", head: true }).eq("business_id", id),
    supabase.from("sales").select("total_amount").eq("business_id", id),
    supabase.from("expenses").select("amount").eq("business_id", id),
    supabase.from("business_members").select("*", { count: "exact", head: true }).eq("business_id", id).eq("status", "active"),
    supabase.from("checkout_stk_requests").select("*", { count: "exact", head: true }).eq("business_id", id),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("business_id", id).not("expiry_date", "is", null).lte("expiry_date", soonCutoff),
    supabase.from("customers").select("credit_balance").eq("business_id", id),
    supabase.from("supplier_debts").select("amount_owed, amount_paid").eq("business_id", id),
    supabase.from("shopify_connections").select("shop_domain, status").eq("business_id", id).maybeSingle(),
    supabase.from("mpesa_merchant_connections").select("is_active, shortcode, till_number, transaction_type").eq("business_id", id).maybeSingle(),
    supabase.from("etims_connections").select("is_connected, kra_pin").eq("business_id", id).maybeSingle(),
  ]);

  const totalRevenue = (revRes.data || []).reduce((s, r) => s + (Number(r.total_amount) || 0), 0);
  const totalExpenses = (expTotalRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalCustomerCredit = (customersCreditRes.data || []).reduce((s, r) => s + (Number(r.credit_balance) || 0), 0);
  const totalSupplierDebt = (supplierDebtsRes.data || []).reduce(
    (s, r) => s + Math.max(0, (Number(r.amount_owed) || 0) - (Number(r.amount_paid) || 0)),
    0
  );

  const mpesaConn = mpesaConnRes.data as { is_active?: boolean; shortcode?: string; till_number?: string | null; transaction_type?: string } | null;
  const shopifyConn = shopifyRes.data as { shop_domain?: string; status?: string } | null;
  const etimsConn = etimsConnRes.data as { is_connected?: boolean; kra_pin?: string } | null;

  return {
    business: business as unknown as BusinessWithOwner,
    counts: {
      sales: salesRes.count || 0,
      products: productsRes.count || 0,
      expenses: expensesRes.count || 0,
      services: servicesRes.count || 0,
      providers: providersRes.count || 0,
      closures: closuresRes.count || 0,
      members: membersRes.count || 0,
      stkRequests: stkCountRes.count || 0,
      expiringProducts: expiringRes.count || 0,
    },
    financials: {
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      totalCustomerCredit,
      totalSupplierDebt,
    },
    integrations: {
      shopifyConnected: Boolean(shopifyConn && shopifyConn.status !== "disconnected"),
      shopifyDomain: shopifyConn?.shop_domain ?? null,
      mpesaStkActive: Boolean(mpesaConn?.is_active),
      mpesaShortcode: mpesaConn?.till_number || mpesaConn?.shortcode || null,
      etimsConnected: Boolean(etimsConn?.is_connected),
      etimsKraPin: etimsConn?.kra_pin ?? null,
    },
  };
}

export async function getBusinessSales(businessId: string, page = 0, pageSize = 20) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, count } = await supabase
    .from("sales")
    .select("*", { count: "exact" })
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  return { sales: (data || []) as Sale[], total: count || 0 };
}

export async function getBusinessProducts(businessId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("name");
  return (data || []) as Product[];
}

export async function getBusinessExpenses(businessId: string, page = 0, pageSize = 20) {
  await requireAdmin();
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
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("day_closures")
    .select("*")
    .eq("business_id", businessId)
    .order("closed_date", { ascending: false });
  return (data || []) as DayClosure[];
}

export async function getBusinessServices(businessId: string) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  const supabase = createAdminClient();
  try {
    const [txRes, cfgRes, stkRes] = await Promise.all([
      supabase
        .from("mpesa_transactions")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(150),
      supabase
        .from("mpesa_merchant_connections")
        .select("id, business_id, transaction_type, shortcode, till_number, account_reference, environment, is_active, last_verified_at, created_at, updated_at")
        .eq("business_id", businessId)
        .maybeSingle(),
      supabase
        .from("checkout_stk_requests")
        .select("id, business_id, initiated_by, sale_id, checkout_request_id, phone, amount_kes, account_reference, status, result_code, result_desc, mpesa_receipt_number, completed_at, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    return {
      transactions: (txRes.data || []) as MpesaTransaction[],
      stkConfig: (cfgRes.data ?? null) as MpesaMerchantConnection | null,
      stkRequests: (stkRes.data || []) as CheckoutStkRequest[],
    };
  } catch {
    return {
      transactions: [] as MpesaTransaction[],
      stkConfig: null as MpesaMerchantConnection | null,
      stkRequests: [] as CheckoutStkRequest[],
    };
  }
}

export async function getBusinessIntegrations(businessId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  try {
    const [shopifyRes, linksRes, mpesaRes, etimsRes, membersRes, debtsRes] = await Promise.all([
      supabase
        .from("shopify_connections")
        .select("id, business_id, shop_domain, status, sync_products, sync_orders, last_synced_at, created_at")
        .eq("business_id", businessId)
        .maybeSingle(),
      supabase
        .from("shopify_product_links")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .from("mpesa_merchant_connections")
        .select("id, business_id, transaction_type, shortcode, till_number, account_reference, environment, is_active, last_verified_at, created_at, updated_at")
        .eq("business_id", businessId)
        .maybeSingle(),
      supabase
        .from("etims_connections")
        .select("id, business_id, kra_pin, bhf_id, device_serial, sdc_id, mrc_no, environment, is_connected, last_synced_at, created_at, updated_at")
        .eq("business_id", businessId)
        .maybeSingle(),
      supabase
        .from("business_members")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("supplier_debts")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
    ]);

    return {
      shopify: (shopifyRes.data ?? null) as ShopifyConnection | null,
      shopifyLinksCount: linksRes.count || 0,
      mpesaStk: (mpesaRes.data ?? null) as MpesaMerchantConnection | null,
      etims: (etimsRes.data ?? null) as EtimsConnection | null,
      members: (membersRes.data || []) as BusinessMember[],
      supplierDebts: (debtsRes.data || []) as SupplierDebt[],
    };
  } catch {
    return {
      shopify: null as ShopifyConnection | null,
      shopifyLinksCount: 0,
      mpesaStk: null as MpesaMerchantConnection | null,
      etims: null as EtimsConnection | null,
      members: [] as BusinessMember[],
      supplierDebts: [] as SupplierDebt[],
    };
  }
}

export async function getBusinessEtims(businessId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  try {
    const [connRes, invoicesRes] = await Promise.all([
      supabase
        .from("etims_connections")
        .select("id, business_id, kra_pin, bhf_id, device_serial, sdc_id, mrc_no, environment, is_connected, last_synced_at, created_at, updated_at")
        .eq("business_id", businessId)
        .maybeSingle(),
      supabase
        .from("etims_invoices")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    return {
      connection: (connRes.data ?? null) as EtimsConnection | null,
      invoices: (invoicesRes.data || []) as EtimsInvoice[],
    };
  } catch {
    return {
      connection: null as EtimsConnection | null,
      invoices: [] as EtimsInvoice[],
    };
  }
}
