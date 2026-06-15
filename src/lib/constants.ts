export const SUBSCRIPTION_PLANS = {
  FREE_TRIAL: { name: "Free Trial", price: 0, duration: "30 days" },
  MONTHLY: { name: "Monthly", price: 249, duration: "1 month" },
  YEARLY: { name: "Yearly", price: 2490, duration: "1 year" },
} as const;

export const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  TRIALING: "bg-[#C8FF00]/10 text-[#C8FF00] border-[#C8FF00]/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PAST_DUE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  GRACE_PERIOD: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  LOCKED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELED: "bg-white/5 text-[#666] border-white/10",
} as const;

export const BUSINESS_CATEGORY_COLORS: Record<string, string> = {
  PRODUCTS: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  SERVICES: "bg-teal-500/10 text-teal-400 border-teal-500/20",
} as const;

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  Cash: "var(--chart-1)",
  "M-PESA": "var(--chart-2)",
  Card: "var(--chart-3)",
  Credit: "var(--chart-4)",
  "Bank Transfer": "var(--chart-5)",
} as const;
