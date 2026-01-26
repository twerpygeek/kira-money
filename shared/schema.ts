import { z } from "zod";

// Asset categories
export const assetCategories = [
  "cash",
  "stocks",
  "crypto",
  "property",
  "vehicles",
  "retirement",
  "other"
] as const;

export type AssetCategory = typeof assetCategories[number];

// Liability categories
export const liabilityCategories = [
  "credit_card",
  "mortgage",
  "personal_loan",
  "student_loan",
  "car_loan",
  "other"
] as const;

export type LiabilityCategory = typeof liabilityCategories[number];

// Supported currencies
export const currencies = [
  "USD", "EUR", "GBP", "JPY", "CNY", "SGD", "MYR", "AUD", "CAD", "CHF", "INR"
] as const;

export type Currency = typeof currencies[number];

// Profile/ownership types
export const ownershipTypes = ["personal", "partner", "shared"] as const;
export type OwnershipType = typeof ownershipTypes[number];

// Asset schema
export const assetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  value: z.number().min(0, "Value must be positive"),
  category: z.enum(assetCategories),
  currency: z.enum(currencies),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ownership: z.enum(ownershipTypes).optional(),
  isRecurring: z.boolean().optional(),
  recurringDay: z.number().min(1).max(31).optional(),
  previousValue: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Asset = z.infer<typeof assetSchema>;
export const insertAssetSchema = assetSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAsset = z.infer<typeof insertAssetSchema>;

// Liability schema
export const liabilitySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  value: z.number().min(0, "Value must be positive"),
  category: z.enum(liabilityCategories),
  currency: z.enum(currencies),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ownership: z.enum(ownershipTypes).optional(),
  isRecurring: z.boolean().optional(),
  recurringDay: z.number().min(1).max(31).optional(),
  previousValue: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Liability = z.infer<typeof liabilitySchema>;
export const insertLiabilitySchema = liabilitySchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLiability = z.infer<typeof insertLiabilitySchema>;

// History snapshot schema
export const historySnapshotSchema = z.object({
  id: z.string(),
  date: z.string(),
  totalAssets: z.number(),
  totalLiabilities: z.number(),
  netWorth: z.number()
});

export type HistorySnapshot = z.infer<typeof historySnapshotSchema>;

// Savings Goal schema
export const goalSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().min(0),
  currentAmount: z.number().min(0),
  currency: z.enum(currencies),
  deadline: z.string().optional(),
  linkedAccountIds: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Goal = z.infer<typeof goalSchema>;
export const insertGoalSchema = goalSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;

// Insight/Alert schema
export const insightSchema = z.object({
  id: z.string(),
  type: z.enum(["milestone", "warning", "tip", "change"]),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  data: z.record(z.any()).optional(),
  createdAt: z.string()
});

export type Insight = z.infer<typeof insightSchema>;

// User settings schema
export const settingsSchema = z.object({
  baseCurrency: z.enum(currencies),
  userName: z.string().optional(),
  partnerName: z.string().optional(),
  privacyMode: z.boolean(),
  showInsights: z.boolean().optional(),
  defaultOwnership: z.enum(ownershipTypes).optional()
});

export type Settings = z.infer<typeof settingsSchema>;

// Exchange rates (hardcoded for MVP)
export const exchangeRates: Record<Currency, number> = {
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  SGD: 1.34,
  MYR: 4.47,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  INR: 83.12
};

// Helper to convert to base currency
export function convertToBaseCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  const amountInUSD = amount / exchangeRates[fromCurrency];
  return amountInUSD * exchangeRates[toCurrency];
}

// Category display names
export const assetCategoryLabels: Record<AssetCategory, string> = {
  cash: "Cash",
  stocks: "Stocks & ETFs",
  crypto: "Cryptocurrency",
  property: "Real Estate",
  vehicles: "Vehicles",
  retirement: "Retirement",
  other: "Other"
};

export const liabilityCategoryLabels: Record<LiabilityCategory, string> = {
  credit_card: "Credit Card",
  mortgage: "Mortgage",
  personal_loan: "Personal Loan",
  student_loan: "Student Loan",
  car_loan: "Car Loan",
  other: "Other"
};

// Currency symbols
export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  SGD: "S$",
  MYR: "RM",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  INR: "₹"
};

// Ownership labels (Yours, Mine, Ours)
export const ownershipLabels: Record<OwnershipType, string> = {
  personal: "Mine",
  partner: "Partner's",
  shared: "Ours"
};

// Goal icon options
export const goalIcons = [
  "home", "plane", "car", "ring", "graduation", "piggy-bank", "heart-pulse", "baby", "party-popper", "smartphone", "laptop", "umbrella-beach"
] as const;

// Goal color options
export const goalColors = [
  "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#6366F1"
] as const;
