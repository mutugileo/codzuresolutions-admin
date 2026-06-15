import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegistrationPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4">
      <Card className="w-full max-w-md border-[rgba(255,255,255,0.08)] bg-[#1A1C1E]">
        <CardHeader className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C8FF00]" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Access pending</h1>
          </div>
          <p className="text-sm text-[#888]">
            Your account exists, but a NeoBuk admin still needs to approve dashboard access.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full bg-[#C8FF00] font-bold text-[#0D0D0D] hover:bg-[#b3e600]">
            <Link href="/login">Back to sign in</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full text-[#C8FF00] hover:bg-white/5 hover:text-[#C8FF00]">
            <Link href="/register">Submit another request</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
