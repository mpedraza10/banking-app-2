import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  boolean, 
  date, 
  decimal, 
  integer, 
  pgEnum
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel, relations } from "drizzle-orm";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", [
  "Cajero Ventanilla",
  "Cajero Jr",
  "Principal Ventanilla"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "Pending",
  "Completed",
  "Failed"
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "Draft",
  "Pending",
  "Posted",
  "Completed",
  "Failed",
  "Cancelled",
  "Rolled Back"
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "ServicePayment",
  "CardPayment",
  "DiestelPayment",
  "CashDeposit",
  "CashWithdrawal"
]);

export const denominationTypeEnum = pgEnum("denomination_type", [
  "Received",
  "Payment",
  "Change"
]);

// ==================== TABLES ====================

// Users table - Supabase Auth integration (existing)
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // UUID from Supabase Auth
  email: text("email").notNull().unique(),
  name: text("name"),
  created_at: timestamp("created_at").defaultNow(),
});

// System Users table - Cashiers and staff
export const systemUsers = pgTable("system_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  branchId: text("branch_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: text("customer_id").unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: date("birth_date"),
  taxId: text("tax_id"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  alternatePhone: text("alternate_phone"),
  street: text("street"),
  exteriorNumber: text("exterior_number"),
  interiorNumber: text("interior_number"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  streetBetween: text("street_between"),
  workEmail: text("work_email"),
  cellPhone: text("cell_phone"),
  hasBafAccount: boolean("has_baf_account").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Accounts table
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountNumber: text("account_number").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  accountType: text("account_type").notNull(),
  minimumPayment: decimal("minimum_payment", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Cards table
export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardNumber: text("card_number").notNull().unique(),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  isActive: boolean("is_active").notNull().default(true),
  cardType: text("card_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  serviceCode: text("service_code").notNull().unique(),
  referenceFormat: text("reference_format").notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(),
  fixedCommission: decimal("fixed_commission", { precision: 10, scale: 2 }),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }),
  dailyLimit: decimal("daily_limit", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Geographic Coverage table
export const geographicCoverage = pgTable("geographic_coverage", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").notNull().references(() => services.id),
  state: text("state").notNull(),
  city: text("city"),
  postalCode: text("postal_code"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Service Payments table
export const servicePayments = pgTable("service_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").notNull().references(() => services.id),
  referenceNumber: text("reference_number").notNull(),
  verificationDigit: text("verification_digit"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date"),
  isExpired: boolean("is_expired").notNull().default(false),
  customerId: uuid("customer_id").references(() => customers.id),
  userId: uuid("user_id").notNull().references(() => systemUsers.id),
  branchId: text("branch_id").notNull(),
  status: paymentStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Card Payments table
export const cardPayments = pgTable("card_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id").notNull().references(() => cards.id),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: text("payment_type").notNull(),
  cashReceived: decimal("cash_received", { precision: 10, scale: 2 }).notNull(),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).notNull(),
  userId: uuid("user_id").notNull().references(() => systemUsers.id),
  branchId: text("branch_id").notNull(),
  status: paymentStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionNumber: text("transaction_number").notNull().unique(),
  transactionType: text("transaction_type").notNull(),
  transactionStatus: text("transaction_status").notNull().default("Draft"),
  totalAmount: text("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  userId: text("user_id").notNull(),
  customerId: text("customer_id"),
  branchId: text("branch_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  postedAt: timestamp("posted_at"),
});

// Transaction Items table
export const transactionItems = pgTable("transaction_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  quantity: integer("quantity").notNull().default(1),
  serviceId: text("service_id"),
  referenceNumber: text("reference_number"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Cash Denominations table
export const cashDenominations = pgTable("cash_denominations", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
  denominationType: denominationTypeEnum("denomination_type").notNull(),
  denomination: decimal("denomination", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  userId: uuid("user_id").notNull().references(() => systemUsers.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Cash Drawer table
export const cashDrawer = pgTable("cash_drawer", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => systemUsers.id),
  denomination: decimal("denomination", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Receipts table
export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: text("transaction_id").notNull(),
  receiptNumber: text("receipt_number").notNull().unique(),
  receiptData: text("receipt_data").notNull(),
  printedAt: timestamp("printed_at").defaultNow(),
  reprintCount: integer("reprint_count").notNull().default(0),
});

// Promotional Offers table
export const promotionalOffers = pgTable("promotional_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cardType: text("card_type"),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// System Configuration table
export const systemConfiguration = pgTable("system_configuration", {
  id: uuid("id").primaryKey().defaultRandom(),
  session_timeout_minutes: integer("session_timeout_minutes").notNull().default(15),
  transaction_timeout_seconds: integer("transaction_timeout_seconds").notNull().default(120),
  max_retry_attempts: integer("max_retry_attempts").notNull().default(3),
  maintenance_mode: boolean("maintenance_mode").notNull().default(false),
  default_receipt_copies: integer("default_receipt_copies").notNull().default(1),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  updated_by: text("updated_by").notNull(),
});

// Commission Rates table
export const commissionRates = pgTable("commission_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  service_name: text("service_name").notNull(),
  service_provider: text("service_provider").notNull(),
  commission_type: text("commission_type").notNull(), // 'fixed' | 'percentage'
  commission_value: decimal("commission_value", { precision: 10, scale: 4 }).notNull(),
  is_active: boolean("is_active").notNull().default(true),
  effective_date: date("effective_date").notNull(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  updated_by: text("updated_by").notNull(),
});

// Service Providers table
export const serviceProviders = pgTable("service_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider_name: text("provider_name").notNull(),
  service_type: text("service_type").notNull(),
  api_endpoint: text("api_endpoint"),
  timeout_seconds: integer("timeout_seconds").notNull().default(30),
  retry_attempts: integer("retry_attempts").notNull().default(3),
  is_active: boolean("is_active").notNull().default(true),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  updated_by: text("updated_by").notNull(),
});

// ==================== TYPE EXPORTS ====================

// Users
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// System Users
export type SystemUser = InferSelectModel<typeof systemUsers>;
export type NewSystemUser = InferInsertModel<typeof systemUsers>;

// Customers
export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;

// Accounts
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

// Cards
export type Card = InferSelectModel<typeof cards>;
export type NewCard = InferInsertModel<typeof cards>;

// Services
export type Service = InferSelectModel<typeof services>;
export type NewService = InferInsertModel<typeof services>;

// Geographic Coverage
export type GeographicCoverage = InferSelectModel<typeof geographicCoverage>;
export type NewGeographicCoverage = InferInsertModel<typeof geographicCoverage>;

// Service Payments
export type ServicePayment = InferSelectModel<typeof servicePayments>;
export type NewServicePayment = InferInsertModel<typeof servicePayments>;

// Card Payments
export type CardPayment = InferSelectModel<typeof cardPayments>;
export type NewCardPayment = InferInsertModel<typeof cardPayments>;

// Transactions
export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

// Transaction Items
export type TransactionItem = InferSelectModel<typeof transactionItems>;
export type NewTransactionItem = InferInsertModel<typeof transactionItems>;

// Audit Logs
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;

// Cash Denominations
export type CashDenomination = InferSelectModel<typeof cashDenominations>;
export type NewCashDenomination = InferInsertModel<typeof cashDenominations>;

// Cash Drawer
export type CashDrawer = InferSelectModel<typeof cashDrawer>;
export type NewCashDrawer = InferInsertModel<typeof cashDrawer>;

// Receipts
export type Receipt = InferSelectModel<typeof receipts>;
export type NewReceipt = InferInsertModel<typeof receipts>;

// Promotional Offers
export type PromotionalOffer = InferSelectModel<typeof promotionalOffers>;
export type NewPromotionalOffer = InferInsertModel<typeof promotionalOffers>;

// System Configuration
export type SystemConfiguration = InferSelectModel<typeof systemConfiguration>;
export type NewSystemConfiguration = InferInsertModel<typeof systemConfiguration>;

// Commission Rates
export type CommissionRate = InferSelectModel<typeof commissionRates>;
export type NewCommissionRate = InferInsertModel<typeof commissionRates>;

// Service Providers
export type ServiceProvider = InferSelectModel<typeof serviceProviders>;
export type NewServiceProvider = InferInsertModel<typeof serviceProviders>;

// ==================== RELATIONS ====================

export const customersRelations = relations(customers, ({ many }) => ({
  cards: many(cards),
  servicePayments: many(servicePayments),
  transactions: many(transactions),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  customer: one(customers, {
    fields: [cards.customerId],
    references: [customers.id],
  }),
  account: one(accounts, {
    fields: [cards.accountId],
    references: [accounts.id],
  }),
  cardPayments: many(cardPayments),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  cards: many(cards),
  cardPayments: many(cardPayments),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  servicePayments: many(servicePayments),
  geographicCoverage: many(geographicCoverage),
}));

export const geographicCoverageRelations = relations(geographicCoverage, ({ one }) => ({
  service: one(services, {
    fields: [geographicCoverage.serviceId],
    references: [services.id],
  }),
}));

export const servicePaymentsRelations = relations(servicePayments, ({ one }) => ({
  service: one(services, {
    fields: [servicePayments.serviceId],
    references: [services.id],
  }),
  customer: one(customers, {
    fields: [servicePayments.customerId],
    references: [customers.id],
  }),
  user: one(systemUsers, {
    fields: [servicePayments.userId],
    references: [systemUsers.id],
  }),
}));

export const cardPaymentsRelations = relations(cardPayments, ({ one }) => ({
  card: one(cards, {
    fields: [cardPayments.cardId],
    references: [cards.id],
  }),
  account: one(accounts, {
    fields: [cardPayments.accountId],
    references: [accounts.id],
  }),
  user: one(systemUsers, {
    fields: [cardPayments.userId],
    references: [systemUsers.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ many }) => ({
  transactionItems: many(transactionItems),
  cashDenominations: many(cashDenominations),
  receipts: many(receipts),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
}));

export const cashDenominationsRelations = relations(cashDenominations, ({ one }) => ({
  transaction: one(transactions, {
    fields: [cashDenominations.transactionId],
    references: [transactions.id],
  }),
  user: one(systemUsers, {
    fields: [cashDenominations.userId],
    references: [systemUsers.id],
  }),
}));

export const cashDrawerRelations = relations(cashDrawer, ({ one }) => ({
  user: one(systemUsers, {
    fields: [cashDrawer.userId],
    references: [systemUsers.id],
  }),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  transaction: one(transactions, {
    fields: [receipts.transactionId],
    references: [transactions.id],
  }),
}));

export const systemUsersRelations = relations(systemUsers, ({ many }) => ({
  servicePayments: many(servicePayments),
  cardPayments: many(cardPayments),
  transactions: many(transactions),
  cashDenominations: many(cashDenominations),
  cashDrawer: many(cashDrawer),
  receipts: many(receipts),
}));
