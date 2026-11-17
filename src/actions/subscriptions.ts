"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/actions/auth";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import type { SubscriptionPlanType } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function getSubscriptionsWithBusinesses() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(`
      *,
      businesses!inner(id, business_name, category, users!inner(full_name, phone))
    `)
    .order("created_at", { ascending: false })
    .limit(5000);

  return data || [];
}

export async function extendTrial(subscriptionId: string, newEndDate: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      trial_end: newEndDate,
      current_period_end: newEndDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/subscriptions");
  revalidatePath("/businesses");
  return { success: true };
}

export async function overrideSubscriptionStatus(
  subscriptionId: string,
  newStatus: string
) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/subscriptions");
  revalidatePath("/businesses");
  return { success: true };
}

export async function overrideSubscriptionPlan(
  subscriptionId: string,
  newPlanType: SubscriptionPlanType
) {
  await requireAdmin();
  const plan = SUBSCRIPTION_PLANS[newPlanType];
  if (!plan) {
    return { error: "Invalid plan type" };
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan_type: newPlanType,
      price: plan.price,
      currency: "KES",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/subscriptions");
  revalidatePath("/businesses");
  return { success: true };
}

export async function getPaymentsByBusiness(businessId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("subscription_charges")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  return data || [];
}
