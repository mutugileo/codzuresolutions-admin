export const KES_PER_USD = 129.96;

export const SUBSCRIPTION_PLANS = {
  FREE_TRIAL: { name: "Free Trial", price: 0, monthlyEquivalentKes: 0, duration: "14 days" },
  MONTHLY: { name: "Standard Monthly", price: 249, monthlyEquivalentKes: 249, duration: "1 month" },
  YEARLY: { name: "Standard Yearly", price: 2490, monthlyEquivalentKes: 2490 / 12, duration: "1 year" },
  PRO_MONTHLY: { name: "Pro Monthly", price: 999, monthlyEquivalentKes: 999, duration: "1 month" },
  PRO_YEARLY: { name: "Pro Yearly", price: 9990, monthlyEquivalentKes: 9990 / 12, duration: "1 year" },
  PRO_PLUS_MONTHLY: { name: "Pro+ Monthly", price: 1500, monthlyEquivalentKes: 1500, duration: "1 month" },
  PRO_PLUS_YEARLY: { name: "Pro+ Yearly", price: 15000, monthlyEquivalentKes: 15000 / 12, duration: "1 year" },
  OMNICHANNEL: { name: "Omnichannel (Legacy)", price: 999, monthlyEquivalentKes: 999, duration: "1 month" },
} as const;

export const STK_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CANCELLED: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const ETIMS_TAX_TYPES: Record<string, { label: string; color: string }> = {
  A: { label: "A · Exempt", color: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
  B: { label: "B · 16% VAT", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  C: { label: "C · 0% Zero", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  D: { label: "D · Non-VAT", color: "bg-white/5 text-muted-foreground border-white/10" },
  E: { label: "E · 8% VAT", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

export const ETIMS_STATUS_COLORS: Record<string, string> = {
  submitted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

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
