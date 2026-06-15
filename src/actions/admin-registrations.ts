"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function approveRegistrationRequestAction(formData: FormData) {
  await requireAdmin();
  const requestId = getFormValue(formData, "requestId");
  const role = getFormValue(formData, "role") || "admin";

  if (!requestId || !["admin", "analyst"].includes(role)) {
    throw new Error("Choose a valid request and role");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("approve_admin_registration_request", {
    request_id: requestId,
    approved_role: role,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}

export async function rejectRegistrationRequestAction(formData: FormData) {
  await requireAdmin();
  const requestId = getFormValue(formData, "requestId");
  const reviewNote = getFormValue(formData, "reviewNote");

  if (!requestId) {
    throw new Error("Choose a registration request");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("reject_admin_registration_request", {
    request_id: requestId,
    review_note: reviewNote || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}
