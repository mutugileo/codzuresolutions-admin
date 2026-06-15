"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function normalizeEmail(email: FormDataEntryValue | null) {
  return String(email || "").trim().toLowerCase();
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user is an admin
  const { data: admin } = await supabase
    .from("admins")
    .select("id, role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "You do not have admin access" };
  }

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const fullName = normalizeText(formData.get("fullName"));
  const email = normalizeEmail(formData.get("email"));
  const phone = normalizeText(formData.get("phone"));
  const organizationName = normalizeText(formData.get("organizationName"));
  const reason = normalizeText(formData.get("reason"));
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: "Full name, email, and password are required" };
  }

  if (password.length < 8) {
    return { error: "Use at least 8 characters for the password" };
  }

  if (password !== confirmPassword) {
    return { error: "The two passwords do not match" };
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        neobuk_admin_registration: "true",
        full_name: fullName,
        phone,
        organization_name: organizationName,
        reason,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user?.id) {
    return {
      success:
        "Your account was created. Check your email to confirm it, then sign in.",
    };
  }

  if (data.session) {
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (admin) {
      redirect("/dashboard");
    }

    await supabase.auth.signOut();
  }

  return {
    success:
      "Your registration request is in. An existing NeoBuk admin needs to approve it before you can enter the dashboard.",
  };
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAdminSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return null;
  }

  return { user, admin };
}
