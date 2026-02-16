import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function BusinessNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h2 className="text-lg font-semibold">Business not found</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        The business you are looking for does not exist or has been removed.
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/businesses">Back to Businesses</Link>
      </Button>
    </div>
  );
}
