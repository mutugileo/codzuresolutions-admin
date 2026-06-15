import { getAdminSession, getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const user = isDemo ? null : await getSession();

  if (!user && !isDemo) {
    redirect("/login");
  }

  const adminSession = isDemo ? null : await getAdminSession();

  if (!adminSession && !isDemo) {
    redirect("/registration-pending");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header email={adminSession?.user.email || "admin@demo.neobuk.co"} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
