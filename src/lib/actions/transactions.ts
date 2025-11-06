"use server";

import { db } from "@/lib/db";
import { transactions, transactionItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

// Transaction status enum
export type TransactionStatus = "Draft" | "Posted" | "Cancelled" | "Pending";
export type TransactionType =
  | "ServicePayment"
  | "CardPayment"
  | "DiestelPayment"
  | "CashDeposit"
  | "CashWithdrawal";

// Transaction creation request
export interface CreateTransactionRequest {
  customerId?: string;
  transactionType: TransactionType;
  totalAmount: number;
  paymentMethod: string;
  branchId: string;
  userId: string; // systemUsers ID
  notes?: string;
  items?: TransactionItemData[];
}

// Transaction item data
export interface TransactionItemData {
  description: string;
  amount: number;
  quantity: number;
  serviceId?: string;
  referenceNumber?: string;
  metadata?: Record<string, unknown>;
}

// Transaction detail response
export interface TransactionDetail {
  id: string;
  transactionNumber: string;
  customerId?: string;
  customerName?: string;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
  postedAt?: Date;
  branchId: string;
  userId: string;
  notes?: string;
  items: TransactionItemDetail[];
}

// Transaction item detail
export interface TransactionItemDetail {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  serviceId?: string;
  referenceNumber?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new transaction in Draft status
 */
export async function createTransaction(
  user: User | null,
  data: CreateTransactionRequest
): Promise<TransactionDetail> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Generate transaction number
    const transactionNumber = await generateTransactionNumber(data.transactionType);

    // Insert transaction
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        transactionNumber,
        customerId: data.customerId,
        transactionType: data.transactionType,
        transactionStatus: "Draft",
        totalAmount: data.totalAmount.toString(),
        paymentMethod: data.paymentMethod,
        branchId: data.branchId,
        userId: data.userId,
        notes: data.notes,
        createdAt: new Date(),
      })
      .returning();

    // Insert transaction items if provided
    const items: TransactionItemDetail[] = [];
    if (data.items && data.items.length > 0) {
      const itemValues = data.items.map((item) => ({
        transactionId: newTransaction.id,
        description: item.description,
        amount: item.amount.toString(),
        quantity: item.quantity,
        serviceId: item.serviceId,
        referenceNumber: item.referenceNumber,
        metadata: item.metadata ? JSON.stringify(item.metadata) : undefined,
      }));

      const insertedItems = await db
        .insert(transactionItems)
        .values(itemValues)
        .returning();

      items.push(
        ...insertedItems.map((item) => ({
          id: item.id,
          description: item.description,
          amount: parseFloat(item.amount),
          quantity: item.quantity,
          serviceId: item.serviceId || undefined,
          referenceNumber: item.referenceNumber || undefined,
          metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
        }))
      );
    }

    return {
      id: newTransaction.id,
      transactionNumber: newTransaction.transactionNumber,
      customerId: newTransaction.customerId || undefined,
      transactionType: newTransaction.transactionType as TransactionType,
      transactionStatus: newTransaction.transactionStatus as TransactionStatus,
      totalAmount: parseFloat(newTransaction.totalAmount),
      paymentMethod: newTransaction.paymentMethod,
      createdAt: newTransaction.createdAt!,
      postedAt: newTransaction.postedAt || undefined,
      branchId: newTransaction.branchId,
      userId: newTransaction.userId,
      notes: newTransaction.notes || undefined,
      items,
    };
  } catch (error) {
    console.error("Create transaction error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create transaction"
    );
  }
}

/**
 * Post a transaction (change status from Draft to Posted)
 */
export async function postTransaction(
  user: User | null,
  transactionId: string
): Promise<TransactionDetail> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get current transaction
    const [currentTransaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!currentTransaction) {
      throw new Error("Transaction not found");
    }

    if (currentTransaction.transactionStatus !== "Draft") {
      throw new Error(
        `Cannot post transaction with status: ${currentTransaction.transactionStatus}`
      );
    }

    // Update transaction status to Posted
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        transactionStatus: "Posted",
        postedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId))
      .returning();

    // Get transaction items
    const items = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));

    return {
      id: updatedTransaction.id,
      transactionNumber: updatedTransaction.transactionNumber,
      customerId: updatedTransaction.customerId || undefined,
      transactionType: updatedTransaction.transactionType as TransactionType,
      transactionStatus: updatedTransaction.transactionStatus as TransactionStatus,
      totalAmount: parseFloat(updatedTransaction.totalAmount),
      paymentMethod: updatedTransaction.paymentMethod,
      createdAt: updatedTransaction.createdAt!,
      postedAt: updatedTransaction.postedAt || undefined,
      branchId: updatedTransaction.branchId,
      userId: updatedTransaction.userId,
      notes: updatedTransaction.notes || undefined,
      items: items.map((item) => ({
        id: item.id,
        description: item.description,
        amount: parseFloat(item.amount),
        quantity: item.quantity,
        serviceId: item.serviceId || undefined,
        referenceNumber: item.referenceNumber || undefined,
        metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
      })),
    };
  } catch (error) {
    console.error("Post transaction error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to post transaction"
    );
  }
}

/**
 * Cancel a transaction
 */
export async function cancelTransaction(
  user: User | null,
  transactionId: string,
  reason: string
): Promise<void> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get current transaction
    const [currentTransaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!currentTransaction) {
      throw new Error("Transaction not found");
    }

    if (currentTransaction.transactionStatus === "Posted") {
      throw new Error("Cannot cancel a posted transaction");
    }

    // Update transaction status to Cancelled
    await db
      .update(transactions)
      .set({
        transactionStatus: "Cancelled",
        notes: currentTransaction.notes
          ? `${currentTransaction.notes}\nCancelled: ${reason}`
          : `Cancelled: ${reason}`,
      })
      .where(eq(transactions.id, transactionId));
  } catch (error) {
    console.error("Cancel transaction error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to cancel transaction"
    );
  }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(
  user: User | null,
  transactionId: string
): Promise<TransactionDetail | null> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transaction) {
      return null;
    }

    const items = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));

    return {
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      customerId: transaction.customerId || undefined,
      transactionType: transaction.transactionType as TransactionType,
      transactionStatus: transaction.transactionStatus as TransactionStatus,
      totalAmount: parseFloat(transaction.totalAmount),
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt!,
      postedAt: transaction.postedAt || undefined,
      branchId: transaction.branchId,
      userId: transaction.userId,
      notes: transaction.notes || undefined,
      items: items.map((item) => ({
        id: item.id,
        description: item.description,
        amount: parseFloat(item.amount),
        quantity: item.quantity,
        serviceId: item.serviceId || undefined,
        referenceNumber: item.referenceNumber || undefined,
        metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
      })),
    };
  } catch (error) {
    console.error("Get transaction by ID error:", error);
    throw new Error("Failed to retrieve transaction");
  }
}

/**
 * Get transaction by transaction number
 */
export async function getTransactionByNumber(
  user: User | null,
  transactionNumber: string
): Promise<TransactionDetail | null> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.transactionNumber, transactionNumber))
      .limit(1);

    if (!transaction) {
      return null;
    }

    const items = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transaction.id));

    return {
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      customerId: transaction.customerId || undefined,
      transactionType: transaction.transactionType as TransactionType,
      transactionStatus: transaction.transactionStatus as TransactionStatus,
      totalAmount: parseFloat(transaction.totalAmount),
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt!,
      postedAt: transaction.postedAt || undefined,
      branchId: transaction.branchId,
      userId: transaction.userId,
      notes: transaction.notes || undefined,
      items: items.map((item) => ({
        id: item.id,
        description: item.description,
        amount: parseFloat(item.amount),
        quantity: item.quantity,
        serviceId: item.serviceId || undefined,
        referenceNumber: item.referenceNumber || undefined,
        metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
      })),
    };
  } catch (error) {
    console.error("Get transaction by number error:", error);
    throw new Error("Failed to retrieve transaction");
  }
}

/**
 * Generate unique transaction number
 */
async function generateTransactionNumber(
  transactionType: TransactionType
): Promise<string> {
  // Format: TYPE-YYYYMMDD-NNNN
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

  const prefix = transactionType.substring(0, 3).toUpperCase();

  // Get count of transactions for today
  const todayStart = new Date(date.setHours(0, 0, 0, 0));
  const todayEnd = new Date(date.setHours(23, 59, 59, 999));

  const todayTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.transactionType, transactionType));

  const todayCount = todayTransactions.filter((t) => {
    const createdAt = t.createdAt;
    return createdAt && createdAt >= todayStart && createdAt <= todayEnd;
  }).length;

  const sequence = String(todayCount + 1).padStart(4, "0");

  return `${prefix}-${dateStr}-${sequence}`;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  user: User | null,
  transactionId: string,
  newStatus: TransactionStatus
): Promise<void> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(transactions)
      .set({
        transactionStatus: newStatus,
      })
      .where(eq(transactions.id, transactionId));
  } catch (error) {
    console.error("Update transaction status error:", error);
    throw new Error("Failed to update transaction status");
  }
}
