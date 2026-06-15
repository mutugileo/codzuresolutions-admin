import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="label-text">{title}</span>
        <Icon className="h-4 w-4 text-[#C8FF00] stroke-[1.5]" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold tracking-tight text-white">{value}</div>
        {description && (
          <p className="text-xs text-[#888] mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
