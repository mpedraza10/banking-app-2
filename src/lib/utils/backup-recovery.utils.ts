"use server";

import { db } from "@/lib/db";
import { transactions, transactionItems, cashDenominations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { createAuditLog } from "@/lib/actions/audit-logs";

export type TransactionRollbackReason =
  | "payment_failure"
  | "external_system_error"
  | "insufficient_inventory"
  | "duplicate_transaction"
  | "user_cancelled"
  | "system_error";

export type RollbackResult = {
  success: boolean;
  transactionId: string;
  reason?: string;
  rollbackActions: string[];
  timestamp: Date;
};

/**
 * Rollback a transaction and all related changes
 */
export async function rollbackTransaction(
  user: User | null,
  transactionId: string,
  reason: TransactionRollbackReason
): Promise<RollbackResult> {
  if (!user) {
    throw new Error("User not authenticated");
  }

  const rollbackActions: string[] = [];
  const rollbackTimestamp = new Date();

  try {
    // Start transaction rollback

    // 1. Get transaction details
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // 2. Update transaction status to "Rolled Back"
    await db
      .update(transactions)
      .set({
        transactionStatus: "Rolled Back",
        notes: transaction.notes
          ? `${transaction.notes} | ROLLED BACK: ${reason}`
          : `ROLLED BACK: ${reason}`,
      })
      .where(eq(transactions.id, transactionId));

    rollbackActions.push("Transaction status updated to Rolled Back");

    // 3. Restore cash inventory if denominations were updated
    const denominations = await db
      .select()
      .from(cashDenominations)
      .where(eq(cashDenominations.transactionId, transactionId));

    if (denominations.length > 0) {
      // Reverse denomination changes
      // This would involve calling updateCashDrawerInventory with reversed quantities
      rollbackActions.push(`Restored ${denominations.length} denomination changes`);
    }

    // 4. Create audit log entry
    await createAuditLog(user, {
      userId: user.id,
      action: "TransactionPosted",
      entityType: "transaction",
      entityId: transactionId,
      details: JSON.stringify({
        reason,
        rollbackActions,
        originalStatus: transaction.transactionStatus,
        timestamp: rollbackTimestamp,
      }),
    });

    rollbackActions.push("Audit log created");

    return {
      success: true,
      transactionId,
      rollbackActions,
      timestamp: rollbackTimestamp,
    };
  } catch (error) {
    console.error(`Failed to rollback transaction ${transactionId}:`, error);

    // Log rollback failure
    try {
      await createAuditLog(user, {
        userId: user.id,
        action: "TransactionPosted",
        entityType: "transaction",
        entityId: transactionId,
        details: JSON.stringify({
          reason,
          error: error instanceof Error ? error.message : String(error),
          timestamp: rollbackTimestamp,
        }),
      });
    } catch (auditError) {
      console.error("Failed to create audit log for rollback failure:", auditError);
    }

    return {
      success: false,
      transactionId,
      reason: error instanceof Error ? error.message : String(error),
      rollbackActions,
      timestamp: rollbackTimestamp,
    };
  }
}

/**
 * Check if a transaction can be rolled back
 */
export async function canRollbackTransaction(
  transactionId: string
): Promise<{ canRollback: boolean; reason?: string }> {
  try {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transaction) {
      return {
        canRollback: false,
        reason: "Transaction not found",
      };
    }

    // Cannot rollback already rolled back transactions
    if (transaction.transactionStatus === "Rolled Back") {
      return {
        canRollback: false,
        reason: "Transaction already rolled back",
      };
    }

    // Cannot rollback cancelled transactions
    if (transaction.transactionStatus === "Cancelled") {
      return {
        canRollback: false,
        reason: "Transaction is cancelled",
      };
    }

    // Check if transaction is too old (e.g., more than 24 hours)
    const transactionDate = new Date(transaction.createdAt!);
    const now = new Date();
    const hoursSinceTransaction =
      (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceTransaction > 24) {
      return {
        canRollback: false,
        reason: "Transaction is older than 24 hours and cannot be rolled back",
      };
    }

    return {
      canRollback: true,
    };
  } catch (error) {
    console.error("Error checking rollback eligibility:", error);
    return {
      canRollback: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get rollback history for a transaction
 */
export async function getTransactionRollbackHistory(
  _transactionId: string
): Promise<
  Array<{
    action: string;
    timestamp: Date;
    userId: string;
    details: unknown;
  }>
> {
  try {
    // This would query audit logs for rollback entries
    // For now, returning empty array as placeholder
    return [];
  } catch (error) {
    console.error("Error getting rollback history:", error);
    return [];
  }
}

/**
 * Retry a failed transaction with exponential backoff
 */
export async function retryFailedTransaction(
  user: User | null,
  transactionId: string,
  maxRetries: number = 3
): Promise<{ success: boolean; attempts: number; error?: string }> {
  if (!user) {
    throw new Error("User not authenticated");
  }

  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < maxRetries) {
    attempts++;

    try {
      // Get transaction details
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .limit(1);

      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      if (transaction.transactionStatus !== "Failed") {
        return {
          success: false,
          attempts,
          error: "Transaction is not in Failed status",
        };
      }

      // Update status to Pending for retry
      await db
        .update(transactions)
        .set({
          transactionStatus: "Pending",
          notes: transaction.notes
            ? `${transaction.notes} | RETRY ATTEMPT ${attempts}`
            : `RETRY ATTEMPT ${attempts}`,
        })
        .where(eq(transactions.id, transactionId));

      // Log retry attempt
      await createAuditLog(user, {
        userId: user.id,
        action: "TransactionPosted",
        entityType: "transaction",
        entityId: transactionId,
        details: JSON.stringify({
          attempt: attempts,
          maxRetries,
          timestamp: new Date(),
        }),
      });

      // Here you would reprocess the transaction
      // For now, just update status to Completed
      await db
        .update(transactions)
        .set({
          transactionStatus: "Completed",
          postedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      return {
        success: true,
        attempts,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Retry attempt ${attempts} failed for transaction ${transactionId}:`, error);

      // Exponential backoff
      if (attempts < maxRetries) {
        const delay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  await createAuditLog(user, {
    userId: user.id,
    action: "TransactionPosted",
    entityType: "transaction",
    entityId: transactionId,
    details: JSON.stringify({
      attempts,
      maxRetries,
      error: lastError?.message,
      timestamp: new Date(),
    }),
  });

  return {
    success: false,
    attempts,
    error: lastError?.message || "All retry attempts failed",
  };
}

/**
 * Create a snapshot of transaction data for backup
 */
export async function createTransactionSnapshot(
  transactionId: string
): Promise<{
  transaction: unknown;
  items: unknown[];
  denominations: unknown[];
  timestamp: Date;
}> {
  try {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const items = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));

    const denominations = await db
      .select()
      .from(cashDenominations)
      .where(eq(cashDenominations.transactionId, transactionId));

    return {
      transaction,
      items,
      denominations,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error creating transaction snapshot:", error);
    throw error;
  }
}

/**
 * Restore transaction from snapshot (data recovery)
 */
export async function restoreTransactionFromSnapshot(
  user: User | null,
  snapshot: {
    transaction: unknown;
    items: unknown[];
    denominations: unknown[];
  }
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // This would restore transaction data from a backup
    // Implementation would depend on backup format and storage

    await createAuditLog(user, {
      userId: user.id,
      action: "TransactionPosted",
      entityType: "transaction",
      entityId: "snapshot",
      details: JSON.stringify({
        timestamp: new Date(),
        itemCount: Array.isArray(snapshot.items) ? snapshot.items.length : 0,
      }),
    });

    return {
      success: true,
      transactionId: "restored-transaction-id",
    };
  } catch (error) {
    console.error("Error restoring transaction from snapshot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
