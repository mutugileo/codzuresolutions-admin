"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Gauge, ShieldCheck, TrendingDown } from "lucide-react";
import type { GrowthReliabilityMetrics } from "@/actions/analytics-extended";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/formatters";

interface GrowthReliabilitySectionProps {
  data: GrowthReliabilityMetrics;
}

function RingMeter({ value }: { value: number }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div
      className="relative mx-auto h-36 w-36 rounded-full"
      style={{
        background: `conic-gradient(#C8FF00 ${safeValue * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
      }}
    >
      <div className="absolute inset-3 rounded-full bg-[#111315] flex items-center justify-center">
        <span className="text-2xl font-extrabold tracking-tight">{formatPercent(safeValue)}</span>
      </div>
    </div>
  );
}

export function GrowthReliabilitySection({ data }: GrowthReliabilitySectionProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const churnLatest = data.monthlyChurnRate;
  const churnPrev = data.churnTrend[data.churnTrend.length - 2]?.rate ?? churnLatest;
  const churnDelta = churnLatest - churnPrev;

  return (
    <section className="mt-8 space-y-4">
      <div>
        <h2 className="section-header">Growth & Reliability</h2>
        <p className="text-muted-foreground text-sm">
          Activation, churn, feature adoption, and payment completion health.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4 text-[#C8FF00]" />
              Activation Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RingMeter value={data.activationRate} />
            <p className="text-center text-sm text-muted-foreground">
              {formatNumber(data.activationActivated)} of{" "}
              {formatNumber(data.activationEligible)} new businesses activated in 14 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-[#FF6B6B]" />
              Monthly Churn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div className="text-3xl font-extrabold tracking-tight">{formatPercent(churnLatest)}</div>
              <div className={churnDelta <= 0 ? "text-xs text-[#00D4AA]" : "text-xs text-[#FF6B6B]"}>
                {churnDelta <= 0 ? "" : "+"}
                {formatPercent(churnDelta)} vs last month
              </div>
            </div>
            <div className="h-[170px]">
              {!isMounted ? (
                <div className="h-full rounded-md bg-white/5" />
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
                  <BarChart data={data.churnTrend}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#888888", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#888888", fontSize: 11 }} tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} width={35} />
                    <Tooltip
                      formatter={(value: unknown) => [formatPercent(Number(value) || 0), "Churn"]}
                      contentStyle={{
                        backgroundColor: "#1A1C1E",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        color: "#FFFFFF",
                      }}
                    />
                    <Bar dataKey="rate" radius={[8, 8, 0, 0]} fill="#FF6B6B" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-[#4ECDC4]" />
              Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.featureUsage.map((item) => (
              <div key={item.feature} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">{item.feature}</span>
                  <span className="text-muted-foreground">
                    {formatPercent(item.rate)} ({formatNumber(item.businesses)})
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(4, Math.min(100, item.rate))}%`,
                      background: "linear-gradient(90deg, #00D4AA 0%, #C8FF00 100%)",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-[#00D4AA]" />
              Payment Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div className="text-3xl font-extrabold tracking-tight">
                {formatPercent(data.paymentSuccessRate)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatNumber(data.paymentSuccessful)} / {formatNumber(data.paymentAttempts)} attempts
              </div>
            </div>
            <div className="h-[170px]">
              {!isMounted ? (
                <div className="h-full rounded-md bg-white/5" />
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
                  <AreaChart data={data.paymentTrend}>
                    <defs>
                      <linearGradient id="paymentRateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#888888", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#888888", fontSize: 11 }} tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} width={35} />
                    <Tooltip
                      formatter={(value: unknown, name: string | undefined) => {
                        const numericValue = Number(value) || 0;
                        if (name === "rate") return [formatPercent(numericValue), "Success rate"];
                        return [String(numericValue), name || "Value"];
                      }}
                      labelFormatter={(label) => `Day: ${String(label)}`}
                      contentStyle={{
                        backgroundColor: "#1A1C1E",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        color: "#FFFFFF",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#00D4AA"
                      strokeWidth={2}
                      fill="url(#paymentRateGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {data.paymentPending > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatNumber(data.paymentPending)} payments are still pending and excluded from success rate.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
