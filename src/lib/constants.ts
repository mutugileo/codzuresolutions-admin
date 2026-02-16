export const SUBSCRIPTION_PLANS = {
  FREE_TRIAL: { name: "Free Trial", price: 0, duration: "30 days" },
  MONTHLY: { name: "Monthly", price: 249, duration: "1 month" },
  YEARLY: { name: "Yearly", price: 2490, duration: "1 year" },
} as const;

export const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  TRIALING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PAST_DUE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  GRACE_PERIOD: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  LOCKED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  CANCELED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
} as const;

export const BUSINESS_CATEGORY_COLORS: Record<string, string> = {
  PRODUCTS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  SERVICES: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
} as const;

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  Cash: "hsl(var(--chart-1))",
  "M-PESA": "hsl(var(--chart-2))",
  Card: "hsl(var(--chart-3))",
  Credit: "hsl(var(--chart-4))",
  "Bank Transfer": "hsl(var(--chart-5))",
} as const;
