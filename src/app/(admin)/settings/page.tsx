import { getSession } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  Shield,
  User,
  UserPlus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { formatDateTime } from "@/lib/formatters";
import {
  approveRegistrationRequestAction,
  rejectRegistrationRequestAction,
} from "@/actions/admin-registrations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface AdminRegistrationRequest {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  organization_name: string | null;
  reason: string | null;
  requested_role: "admin" | "analyst";
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

async function getAdminInfo(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
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

async function getRegistrationRequests(): Promise<AdminRegistrationRequest[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc(
    "get_pending_admin_registration_requests"
  );

  if (error) {
    return [];
  }

  return (data || []) as AdminRegistrationRequest[];
}

export default async function SettingsPage() {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const user = isDemo ? null : await getSession();
  const adminInfo = user ? await getAdminInfo(user.id) : null;
  const stats = await getSystemStats();
  const registrationRequests = isDemo ? [] : await getRegistrationRequests();

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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Subscriptions</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/subscriptions">Open</Link>
                </Button>
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
                in Supabase. New people register first, then an approved admin reviews the request below.
              </p>
              <p>
                Available admin actions: extend trials, override subscription statuses,
                view all business data and analytics.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registration Requests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Registration Requests</CardTitle>
            </div>
            <CardDescription>Review people who have asked for dashboard access</CardDescription>
          </CardHeader>
          <CardContent>
            {registrationRequests.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No pending registration requests right now.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{request.full_name}</p>
                          <p className="text-xs text-muted-foreground">{request.email}</p>
                          {request.phone && (
                            <p className="text-xs text-muted-foreground">{request.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{request.organization_name || "—"}</TableCell>
                      <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                        {request.reason || "No reason provided"}
                      </TableCell>
                      <TableCell>{formatDateTime(request.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <form action={approveRegistrationRequestAction} className="flex items-center gap-2">
                            <input type="hidden" name="requestId" value={request.id} />
                            <select
                              name="role"
                              defaultValue={request.requested_role}
                              className="h-9 rounded-md border bg-background px-2 text-sm"
                            >
                              <option value="admin">Admin</option>
                              <option value="analyst">Analyst</option>
                            </select>
                            <Button type="submit" size="sm" className="gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </Button>
                          </form>
                          <form action={rejectRegistrationRequestAction}>
                            <input type="hidden" name="requestId" value={request.id} />
                            <Button type="submit" size="sm" variant="outline" className="gap-1">
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
