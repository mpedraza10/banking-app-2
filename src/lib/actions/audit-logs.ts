"use server";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import type { User } from "@supabase/supabase-js";

// Audit action types
export type AuditAction =
  | "TransactionCreated"
  | "TransactionPosted"
  | "TransactionCancelled"
  | "ReceiptGenerated"
  | "ReceiptReprinted"
  | "CashReceived"
  | "ChangeDispensed"
  | "PaymentProcessed"
  | "CustomerSearched"
  | "CustomerUpdated"
  | "ServicePayment"
  | "CardPayment"
  | "DiestelPayment"
  | "ReconciliationPerformed"
  | "InventoryUpdated"
  | "UserLogin"
  | "UserLogout"
  | "ConfigurationChanged";

// Audit log entry request
export interface CreateAuditLogRequest {
  userId: string;
  action: AuditAction;
  entityType: string; // "Transaction", "Receipt", "Customer", etc.
  entityId?: string;
  details?: string; // JSON string
  ipAddress?: string;
  userAgent?: string;
}

// Audit log entry response
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: string; // JSON string
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  user: User | null,
  data: CreateAuditLogRequest
): Promise<AuditLogEntry> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const [newLog] = await db
      .insert(auditLogs)
      .values({
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date(),
      })
      .returning();

    return {
      id: newLog.id,
      userId: newLog.userId,
      action: newLog.action as AuditAction,
      entityType: newLog.entityType,
      entityId: newLog.entityId || undefined,
      details: newLog.details || undefined,
      ipAddress: newLog.ipAddress || undefined,
      userAgent: newLog.userAgent || undefined,
      timestamp: newLog.timestamp!,
    };
  } catch (error) {
    console.error("Create audit log error:", error);
    throw new Error("Failed to create audit log");
  }
}

/**
 * Get audit logs by entity
 */
export async function getAuditLogsByEntity(
  user: User | null,
  entityType: string,
  entityId: string
): Promise<AuditLogEntry[]> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const logs = await db.select().from(auditLogs);

    // Filter in memory
    const filtered = logs.filter(
      (log) => log.entityType === entityType && log.entityId === entityId
    );

    return filtered.map((log) => ({
      id: log.id,
      userId: log.userId,
      action: log.action as AuditAction,
      entityType: log.entityType,
      entityId: log.entityId || undefined,
      details: log.details || undefined,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
      timestamp: log.timestamp!,
    }));
  } catch (error) {
    console.error("Get audit logs by entity error:", error);
    throw new Error("Failed to retrieve audit logs");
  }
}

/**
 * Get audit logs by user
 */
export async function getAuditLogsByUser(
  user: User | null,
  targetUserId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const logs = await db.select().from(auditLogs);

    // Filter by user and sort by timestamp descending
    const filtered = logs
      .filter((log) => log.userId === targetUserId)
      .sort((a, b) => {
        const timeA = a.timestamp?.getTime() || 0;
        const timeB = b.timestamp?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, limit);

    return filtered.map((log) => ({
      id: log.id,
      userId: log.userId,
      action: log.action as AuditAction,
      entityType: log.entityType,
      entityId: log.entityId || undefined,
      details: log.details || undefined,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
      timestamp: log.timestamp!,
    }));
  } catch (error) {
    console.error("Get audit logs by user error:", error);
    throw new Error("Failed to retrieve audit logs");
  }
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(
  user: User | null,
  limit: number = 50
): Promise<AuditLogEntry[]> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const logs = await db.select().from(auditLogs);

    // Sort by timestamp descending and limit
    const sorted = logs
      .sort((a, b) => {
        const timeA = a.timestamp?.getTime() || 0;
        const timeB = b.timestamp?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, limit);

    return sorted.map((log) => ({
      id: log.id,
      userId: log.userId,
      action: log.action as AuditAction,
      entityType: log.entityType,
      entityId: log.entityId || undefined,
      details: log.details || undefined,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
      timestamp: log.timestamp!,
    }));
  } catch (error) {
    console.error("Get recent audit logs error:", error);
    throw new Error("Failed to retrieve audit logs");
  }
}

/**
 * Log transaction creation
 */
export async function logTransactionCreated(
  user: User | null,
  transactionId: string,
  transactionData: Record<string, unknown>
): Promise<void> {
  if (!user) return;

  await createAuditLog(user, {
    userId: user.id,
    action: "TransactionCreated",
    entityType: "Transaction",
    entityId: transactionId,
    details: JSON.stringify(transactionData),
  });
}

/**
 * Log transaction posted
 */
export async function logTransactionPosted(
  user: User | null,
  transactionId: string,
  transactionNumber: string
): Promise<void> {
  if (!user) return;

  await createAuditLog(user, {
    userId: user.id,
    action: "TransactionPosted",
    entityType: "Transaction",
    entityId: transactionId,
    details: JSON.stringify({
      transactionNumber,
      postedAt: new Date().toISOString(),
    }),
  });
}

/**
 * Log receipt generated
 */
export async function logReceiptGenerated(
  user: User | null,
  receiptId: string,
  receiptNumber: string,
  transactionId: string
): Promise<void> {
  if (!user) return;

  await createAuditLog(user, {
    userId: user.id,
    action: "ReceiptGenerated",
    entityType: "Receipt",
    entityId: receiptId,
    details: JSON.stringify({
      receiptNumber,
      transactionId,
      generatedAt: new Date().toISOString(),
    }),
  });
}

/**
 * Log receipt reprinted
 */
export async function logReceiptReprinted(
  user: User | null,
  receiptId: string,
  receiptNumber: string,
  reprintCount: number
): Promise<void> {
  if (!user) return;

  await createAuditLog(user, {
    userId: user.id,
    action: "ReceiptReprinted",
    entityType: "Receipt",
    entityId: receiptId,
    details: JSON.stringify({
      receiptNumber,
      reprintCount,
      reprintedAt: new Date().toISOString(),
    }),
  });
}

/**
 * Log payment processed
 */
export async function logPaymentProcessed(
  user: User | null,
  transactionId: string,
  paymentType: string,
  amount: number
): Promise<void> {
  if (!user) return;

  await createAuditLog(user, {
    userId: user.id,
    action: "PaymentProcessed",
    entityType: "Transaction",
    entityId: transactionId,
    details: JSON.stringify({
      paymentType,
      amount,
      processedAt: new Date().toISOString(),
    }),
  });
}

/**
 * Log cash denomination tracking
 */
export async function logCashDenominationTracking(
  user: User | null,
  trackingType: "received" | "payment" | "change",
  transactionId: string,
  denominations: Record<string, number>,
  totalAmount: number
): Promise<void> {
  if (!user) return;

  await createAuditLog(user, {
    userId: user.id,
    action: "CashReceived",
    entityType: "CashTracking",
    entityId: transactionId,
    details: JSON.stringify({
      trackingType,
      denominations,
      totalAmount,
      trackedAt: new Date().toISOString(),
    }),
  });
}

/**
 * Log reconciliation performed
 */
export async function logReconciliationPerformed(
  user: User | null,
  reconciliationData: Record<string, unknown>
): Promise<void> {
  if (!user) return;

  await createAuditLog(user, {
    userId: user.id,
    action: "ReconciliationPerformed",
    entityType: "Reconciliation",
    details: JSON.stringify({
      ...reconciliationData,
      performedAt: new Date().toISOString(),
    }),
  });
}
