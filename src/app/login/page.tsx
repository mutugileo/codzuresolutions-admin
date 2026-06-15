"use client";

import { useState } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4">
      <Card className="w-full max-w-sm border-[rgba(255,255,255,0.08)] bg-[#1A1C1E]">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C8FF00]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">NeoBuk Admin</h1>
          </div>
          <p className="text-sm text-[#888]">Sign in to the admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="label-text">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@neobuk.co.ke"
                required
                autoComplete="email"
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
                required
                autoComplete="current-password"
                className="bg-[#0D0D0D] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#555]"
              />
            </div>
            {error && (
              <p className="text-sm text-[#FF6B6B]">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#C8FF00] text-[#0D0D0D] font-bold hover:bg-[#b3e600] transition-colors"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-[#888]">
            Need dashboard access?{" "}
            <Link href="/register" className="font-medium text-[#C8FF00] hover:text-[#b3e600]">
              Request registration
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
