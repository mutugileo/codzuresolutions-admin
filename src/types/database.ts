export interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  accepted_terms_at: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_user_id: string;
  business_name: string;
  category: "SERVICES" | "PRODUCTS";
  subtype: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessWithOwner extends Business {
  users: User;
  subscriptions: Subscription[];
}

export interface Subscription {
  id: string;
  business_id: string;
  plan_type: "FREE_TRIAL" | "MONTHLY" | "YEARLY";
  price: number;
  currency: string;
  status: SubscriptionStatus;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "GRACE_PERIOD"
  | "LOCKED"
  | "CANCELED";

export interface SubscriptionWithBusiness extends Subscription {
  businesses: Business & { users: User };
}

export interface Payment {
  id: string;
  subscription_id: string;
  provider: "MPESA" | "PAYSTACK" | "CHAPA";
  amount: number;
  currency: string;
  reference: string | null;
  phone_number: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED";
  paid_at: string | null;
  created_at: string;
}

export interface Sale {
  id: string;
  business_id: string;
  sale_number: string | null;
  sale_type: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_reference: string | null;
  payment_status: string;
  amount_paid: number | null;
  change_given: number;
  customer_name: string | null;
  customer_phone: string | null;
  recorded_by: string | null;
  sale_date: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  item_type: string;
  product_id: string | null;
  product_name: string | null;
  service_id: string | null;
  service_name: string | null;
  provider_id: string | null;
  provider_name: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  unit_cost: number;
  commission_amount: number;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  category_id: string | null;
  cost_price: number;
  selling_price: number;
  wholesale_price: number | null;
  quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  business_id: string;
  user_id: string | null;
  title: string;
  amount: number;
  description: string | null;
  expense_date: string;
  category_id: string | null;
  payment_method: string | null;
  reference_number: string | null;
  receipt_url: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceDefinition {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  base_price: number;
  commission_override: number | null;
  commission_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: string;
  business_id: string;
  full_name: string;
  role: string | null;
  phone_number: string | null;
  email: string | null;
  commission_type: string;
  commission_rate: number;
  flat_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DayClosure {
  id: string;
  business_id: string;
  closure_date: string;
  total_sales_amount: number;
  total_sales_count: number;
  total_expenses_amount: number;
  total_expenses_count: number;
  cash_in_hand_expected: number;
  cash_in_hand_actual: number;
  discrepancy: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  total_transactions: number;
  total_spent: number;
  last_transaction_date: string | null;
  credit_balance: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface MpesaTransaction {
  id: string;
  business_id: string;
  transaction_code: string | null;
  transaction_type: string | null;
  amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  recipient_name: string | null;
  balance: number | null;
  transaction_date: string | null;
  raw_sms: string | null;
  status: string;
  confirmed_sale_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformOverview {
  totalBusinesses: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  lockedSubscriptions: number;
  totalSalesVolume: number;
  subscriptionRevenue: number;
  signupsToday: number;
  signupsWeek: number;
  signupsMonth: number;
  dau: number;
  ritualEngagement: number;
  conversionRate: number;
}
