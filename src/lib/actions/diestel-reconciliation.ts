"use server";

import { db } from "@/lib/db";
import { servicePayments, services } from "@/lib/db/schema";
import { eq, and, between } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

// Reconciliation record interface
export interface ReconciliationRecord {
  transactionId: string;
  referenceNumber: string;
  paymentAmount: number;
  transactionDate: Date;
  diestelFileMatch?: boolean;
  diestelFileAmount?: number;
  matchStatus: "Matched" | "Pending" | "Discrepancy" | "Not Found";
  discrepancyAmount?: number;
  notes?: string;
}

// Reconciliation summary interface
export interface ReconciliationSummary {
  totalTransactions: number;
  matchedTransactions: number;
  pendingTransactions: number;
  discrepancyTransactions: number;
  totalAmount: number;
  matchedAmount: number;
  discrepancyAmount: number;
  reconciliationRate: number;
}

/**
 * Get Diestel transactions for reconciliation
 * Retrieves all Diestel payments within a date range
 */
export async function getDiestelTransactionsForReconciliation(
  user: User | null,
  startDate: Date,
  endDate: Date
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get Diestel service
    const diestelServiceResult = await db
      .select()
      .from(services)
      .where(and(eq(services.serviceCode, "DIESTEL"), eq(services.isActive, true)))
      .limit(1);

    if (diestelServiceResult.length === 0) {
      throw new Error("Diestel service not configured");
    }

    const diestelService = diestelServiceResult[0];

    // Get all Diestel payments in date range
    const payments = await db
      .select()
      .from(servicePayments)
      .where(
        and(
          eq(servicePayments.serviceId, diestelService.id),
          eq(servicePayments.status, "Completed"),
          between(servicePayments.createdAt, startDate, endDate)
        )
      )
      .orderBy(servicePayments.createdAt);

    return payments.map((payment) => ({
      id: payment.id,
      referenceNumber: payment.referenceNumber,
      paymentAmount: parseFloat(payment.paymentAmount),
      transactionDate: payment.createdAt,
      status: payment.status,
      customerId: payment.customerId,
      userId: payment.userId,
    }));
  } catch (error) {
    console.error("Get Diestel transactions error:", error);
    throw new Error("Failed to retrieve Diestel transactions");
  }
}

/**
 * Search transaction by reference number
 * Used for manual reconciliation lookup
 */
export async function searchDiestelTransaction(
  user: User | null,
  referenceNumber: string
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const cleanReference = referenceNumber.replace(/[\s-]/g, "");

    if (cleanReference.length !== 30) {
      throw new Error("Invalid reference number format. Must be 30 digits.");
    }

    // Get Diestel service
    const diestelServiceResult = await db
      .select()
      .from(services)
      .where(and(eq(services.serviceCode, "DIESTEL"), eq(services.isActive, true)))
      .limit(1);

    if (diestelServiceResult.length === 0) {
      throw new Error("Diestel service not configured");
    }

    const diestelService = diestelServiceResult[0];

    // Search for transaction
    const transaction = await db
      .select()
      .from(servicePayments)
      .where(
        and(
          eq(servicePayments.serviceId, diestelService.id),
          eq(servicePayments.referenceNumber, cleanReference)
        )
      )
      .limit(1);

    if (transaction.length === 0) {
      return null;
    }

    return {
      id: transaction[0].id,
      referenceNumber: transaction[0].referenceNumber,
      paymentAmount: parseFloat(transaction[0].paymentAmount),
      transactionDate: transaction[0].createdAt,
      status: transaction[0].status,
      customerId: transaction[0].customerId,
      userId: transaction[0].userId,
    };
  } catch (error) {
    console.error("Search Diestel transaction error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to search transaction"
    );
  }
}

/**
 * Process Diestel file for reconciliation
 * Parses Diestel reconciliation file and matches with system transactions
 * 
 * File format expected (example):
 * REFERENCE_NUMBER|AMOUNT|DATE|STATUS
 * 123456789012345678901234567890|1000.00|2024-01-15|CONFIRMED
 */
export async function processDiestelReconciliationFile(
  user: User | null,
  fileContent: string
): Promise<ReconciliationRecord[]> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const lines = fileContent.trim().split("\n");
    const reconciliationRecords: ReconciliationRecord[] = [];

    // Skip header line if present
    const dataLines = lines[0].includes("REFERENCE") ? lines.slice(1) : lines;

    for (const line of dataLines) {
      if (!line.trim()) continue;

      const parts = line.split("|");
      if (parts.length < 3) continue;

      const fileReference = parts[0].trim();
      const fileAmount = parseFloat(parts[1].trim());

      // Search for matching transaction
      const transaction = await searchDiestelTransaction(user, fileReference);

      if (!transaction) {
        reconciliationRecords.push({
          transactionId: "N/A",
          referenceNumber: fileReference,
          paymentAmount: 0,
          transactionDate: new Date(),
          diestelFileMatch: false,
          diestelFileAmount: fileAmount,
          matchStatus: "Not Found",
          notes: "Transaction not found in system",
        });
        continue;
      }

      // Check for amount discrepancy
      const amountDifference = Math.abs(transaction.paymentAmount - fileAmount);
      const hasDiscrepancy = amountDifference > 0.01; // Allow 1 cent tolerance

      reconciliationRecords.push({
        transactionId: transaction.id,
        referenceNumber: transaction.referenceNumber,
        paymentAmount: transaction.paymentAmount,
        transactionDate: transaction.transactionDate,
        diestelFileMatch: true,
        diestelFileAmount: fileAmount,
        matchStatus: hasDiscrepancy ? "Discrepancy" : "Matched",
        discrepancyAmount: hasDiscrepancy ? amountDifference : undefined,
        notes: hasDiscrepancy
          ? `Amount mismatch: System $${transaction.paymentAmount} vs File $${fileAmount}`
          : "Transaction matched successfully",
      });
    }

    return reconciliationRecords;
  } catch (error) {
    console.error("Process reconciliation file error:", error);
    throw new Error("Failed to process reconciliation file");
  }
}

/**
 * Generate reconciliation summary
 * Provides statistics for a set of reconciliation records
 */
export async function generateReconciliationSummary(
  user: User | null,
  records: ReconciliationRecord[]
): Promise<ReconciliationSummary> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  const totalTransactions = records.length;
  const matchedTransactions = records.filter((r) => r.matchStatus === "Matched").length;
  const pendingTransactions = records.filter((r) => r.matchStatus === "Pending").length;
  const discrepancyTransactions = records.filter((r) => r.matchStatus === "Discrepancy").length;

  const totalAmount = records.reduce((sum, r) => sum + r.paymentAmount, 0);
  const matchedAmount = records
    .filter((r) => r.matchStatus === "Matched")
    .reduce((sum, r) => sum + r.paymentAmount, 0);
  const discrepancyAmount = records
    .filter((r) => r.matchStatus === "Discrepancy")
    .reduce((sum, r) => sum + (r.discrepancyAmount || 0), 0);

  const reconciliationRate =
    totalTransactions > 0 ? (matchedTransactions / totalTransactions) * 100 : 0;

  return {
    totalTransactions,
    matchedTransactions,
    pendingTransactions,
    discrepancyTransactions,
    totalAmount,
    matchedAmount,
    discrepancyAmount,
    reconciliationRate,
  };
}

/**
 * Get reconciliation report for date range
 * Complete reconciliation report with all transactions
 */
export async function getReconciliationReport(
  user: User | null,
  startDate: Date,
  endDate: Date
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const transactions = await getDiestelTransactionsForReconciliation(
      user,
      startDate,
      endDate
    );

    // Convert to reconciliation records (all pending until file is processed)
    const records: ReconciliationRecord[] = transactions.map((txn) => ({
      transactionId: txn.id,
      referenceNumber: txn.referenceNumber,
      paymentAmount: txn.paymentAmount,
      transactionDate: txn.transactionDate,
      matchStatus: "Pending" as const,
      notes: "Awaiting Diestel file reconciliation",
    }));

    const summary = await generateReconciliationSummary(user, records);

    return {
      startDate,
      endDate,
      records,
      summary,
    };
  } catch (error) {
    console.error("Get reconciliation report error:", error);
    throw new Error("Failed to generate reconciliation report");
  }
}
