import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  boolean, 
  date, 
  decimal, 
  integer, 
  pgEnum,
  json
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
  "Pending",
  "Completed",
  "Failed",
  "Rolled Back"
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "ServicePayment",
  "CardPayment"
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
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
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
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  referenceId: uuid("reference_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull(),
  userId: uuid("user_id").notNull().references(() => systemUsers.id),
  customerId: uuid("customer_id").references(() => customers.id),
  branchId: text("branch_id").notNull(),
  externalReferenceId: text("external_reference_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
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
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
  receiptNumber: text("receipt_number").notNull().unique(),
  originalPrint: boolean("original_print").notNull().default(true),
  printedAt: timestamp("printed_at").notNull().defaultNow(),
  userId: uuid("user_id").notNull().references(() => systemUsers.id),
  receiptData: json("receipt_data").notNull(),
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

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(systemUsers, {
    fields: [transactions.userId],
    references: [systemUsers.id],
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  cashDenominations: many(cashDenominations),
  receipts: many(receipts),
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
  user: one(systemUsers, {
    fields: [receipts.userId],
    references: [systemUsers.id],
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
