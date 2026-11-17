"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import type { SubscriptionPlanType } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function getSubscriptionsWithBusinesses() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(`
      *,
      businesses!inner(id, business_name, category, users!inner(full_name, phone))
    `)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function extendTrial(subscriptionId: string, newEndDate: string) {
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

export async function getPaymentsBySubscription(subscriptionId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .order("created_at", { ascending: false });
  return data || [];
}
