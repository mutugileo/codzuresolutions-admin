"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.success) {
      setSuccess(result.success);
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4 py-10">
      <Card className="w-full max-w-xl border-[rgba(255,255,255,0.08)] bg-[#1A1C1E]">
        <CardHeader className="space-y-2 pb-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C8FF00]" />
            <h1 className="text-2xl font-bold tracking-tight text-white">NeoBuk Admin</h1>
          </div>
          <p className="text-sm text-[#888]">
            Request access to the admin dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="fullName" className="label-text">
                  Full name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Jane Wanjiku"
                  required
                  autoComplete="name"
                  className="bg-[#0D0D0D] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#555]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="label-text">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@neobuk.co.ke"
                  required
                  autoComplete="email"
                  className="bg-[#0D0D0D] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#555]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="label-text">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+254 7..."
                  autoComplete="tel"
                  className="bg-[#0D0D0D] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#555]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="organizationName" className="label-text">
                  Team or business
                </label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="NeoBuk Operations"
                  className="bg-[#0D0D0D] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#555]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="label-text">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="bg-[#0D0D0D] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#555]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="label-text">
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="bg-[#0D0D0D] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#555]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reason" className="label-text">
                Access reason
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder="Tell the admin team why you need dashboard access."
                className="flex w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-[#555] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00]/40"
              />
            </div>

            {error && <p className="text-sm text-[#FF6B6B]">{error}</p>}
            {success && <p className="text-sm text-[#C8FF00]">{success}</p>}

            <Button
              type="submit"
              className="w-full bg-[#C8FF00] font-bold text-[#0D0D0D] transition-colors hover:bg-[#b3e600]"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit registration request"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[#888]">
            Already approved?{" "}
            <Link href="/login" className="font-medium text-[#C8FF00] hover:text-[#b3e600]">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
