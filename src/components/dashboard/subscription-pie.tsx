"use client";

import { useSyncExternalStore } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { SubscriptionDistItem } from "@/actions/analytics";

interface SubscriptionPieProps {
  data: SubscriptionDistItem[];
}

export function SubscriptionPie({ data }: SubscriptionPieProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <span className="section-header">Subscription Status</span>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            !isMounted ? (
              <div className="h-full rounded-md bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [
                      `${Number(value)} (${((Number(value) / total) * 100).toFixed(0)}%)`,
                      String(name),
                    ]}
                    contentStyle={{
                      backgroundColor: "#1A1C1E",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-xs text-[#888]">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-[#888]">
              No subscription data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
