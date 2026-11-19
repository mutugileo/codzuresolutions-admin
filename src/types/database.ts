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

export type SubscriptionPlanType =
  | "FREE_TRIAL"
  | "MONTHLY"
  | "YEARLY"
  | "PRO_MONTHLY"
  | "PRO_YEARLY"
  | "PRO_PLUS_MONTHLY"
  | "PRO_PLUS_YEARLY"
  | "OMNICHANNEL";

export interface Subscription {
  id: string;
  business_id: string;
  plan_type: SubscriptionPlanType;
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
  business_id: string;
  user_id: string | null;
  plan_code: string;
  amount_kes: number;
  currency: string;
  reference: string | null;
  phone: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED";
  paid_at: string | null;
  created_at: string;
}

export interface Sale {
  id: string;
  business_id: string;
  sale_number: string | null;
  subtotal: number;
  total_amount: number;
  payment_method: string;
  payment_reference: string | null;
  customer_name: string | null;
  customer_id: string | null;
  channel: string | null;
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
  barcode: string | null;
  category: string | null;
  unit: string | null;
  cost_price: number;
  selling_price: number;
  quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  expiry_date?: string | null;
  tax_type?: "A" | "B" | "C" | "D" | "E";
  etims_item_code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EtimsConnection {
  id: string;
  business_id: string;
  kra_pin: string;
  bhf_id: string;
  device_serial: string;
  sdc_id: string | null;
  mrc_no: string | null;
  environment: "sandbox" | "production";
  is_connected: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EtimsInvoice {
  id: string;
  business_id: string;
  sale_id: string;
  invoice_number: string;
  cu_invoice_number: string | null;
  receipt_signature: string | null;
  sdc_id: string | null;
  mrc_no: string | null;
  qr_url: string | null;
  taxable_amount: number;
  tax_amount: number;
  total_amount: number;
  status: "pending" | "submitted" | "failed";
  error_message: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MpesaMerchantConnection {
  id: string;
  business_id: string;
  transaction_type: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";
  shortcode: string;
  till_number: string | null;
  account_reference: string | null;
  environment: "sandbox" | "production";
  is_active: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckoutStkRequest {
  id: string;
  business_id: string;
  initiated_by: string | null;
  sale_id: string | null;
  checkout_request_id: string | null;
  phone: string;
  amount_kes: number;
  account_reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  result_code: string | null;
  result_desc: string | null;
  mpesa_receipt_number: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ShopifyConnection {
  id: string;
  business_id: string;
  shop_domain: string;
  status: string;
  sync_products: boolean;
  sync_orders: boolean;
  last_synced_at: string | null;
  created_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string | null;
  invited_email: string;
  display_name: string | null;
  role: "manager" | "cashier";
  status: "invited" | "active" | "revoked";
  created_at: string;
}

export interface SupplierDebt {
  id: string;
  business_id: string;
  supplier_name: string;
  amount_owed: number;
  amount_paid: number;
  due_date: string | null;
  status: string;
  created_at: string;
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
  closed_date: string | null;
  closure_date: string | null;
  expected_cash: number;
  actual_cash: number;
  variance: number;
  variance_reason: string | null;
  total_sales: number;
  cash_sales: number;
  mpesa_sales: number;
  credit_sales: number;
  total_expenses: number;
  net_profit: number;
  closed_by: string | null;
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
