import { getSession } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { Shield, User, Clock, Database } from "lucide-react";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { formatDateTime } from "@/lib/formatters";

async function getAdminInfo(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

async function getSystemStats() {
  const supabase = createAdminClient();

  const [
    { count: businessCount },
    { count: userCount },
    { count: subscriptionCount },
    { count: saleCount },
  ] = await Promise.all([
    supabase.from("businesses").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }),
    supabase.from("sales").select("*", { count: "exact", head: true }),
  ]);

  return {
    businesses: businessCount || 0,
    users: userCount || 0,
    subscriptions: subscriptionCount || 0,
    sales: saleCount || 0,
  };
}

export default async function SettingsPage() {
  const user = await getSession();
  const adminInfo = user ? await getAdminInfo(user.id) : null;
  const stats = await getSystemStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Admin preferences and system information.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Admin Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Admin Profile</CardTitle>
            </div>
            <CardDescription>Your admin account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user?.email || "—"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant="secondary" className="capitalize">
                  {adminInfo?.role?.replace("_", " ") || "Admin"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {user?.id?.slice(0, 8)}...
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sign In</span>
                <span className="text-sm">
                  {user?.last_sign_in_at
                    ? formatDateTime(user.last_sign_in_at)
                    : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Appearance</CardTitle>
            </div>
            <CardDescription>Customize the dashboard look and feel</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelector />
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">System Overview</CardTitle>
            </div>
            <CardDescription>Platform data summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.users.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Businesses</p>
                <p className="text-2xl font-bold">{stats.businesses.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Subscriptions</p>
                <p className="text-2xl font-bold">{stats.subscriptions.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{stats.sales.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Admin Access</CardTitle>
            </div>
            <CardDescription>Information about admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
              <p>
                This dashboard uses a <strong>service role key</strong> to access Supabase data,
                bypassing Row Level Security. All data across all businesses is visible.
              </p>
              <p>
                Admin access is managed through the <code className="text-xs bg-muted px-1 py-0.5 rounded">admins</code> table
                in Supabase. To add a new admin, insert a row with their auth user ID and email.
              </p>
              <p>
                Available admin actions: extend trials, override subscription statuses,
                view all business data and analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
