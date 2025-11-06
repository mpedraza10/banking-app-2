"use server";

import { db } from "@/lib/db";
import { services, servicePayments } from "@/lib/db/schema";
import { eq, and, gte, sum, sql } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

// Diestel payment request interface
export interface DiestelPaymentRequest {
  referenceNumber: string; // 30-digit reference
  paymentAmount: number;
  customerId?: string;
  userId: string;
  branchId: string;
}

// Credit limit tracking interface
export interface CreditLimitStatus {
  totalCreditUsed: number;
  creditLimit: number;
  remainingCredit: number;
  dailyUsed: number;
  dailyLimit: number;
  remainingDailyLimit: number;
  canProcess: boolean;
  message?: string;
}

// SPEI payment schedule interface
export interface SPEISchedule {
  scheduledDate: Date;
  totalAmount: number;
  transactionCount: number;
  status: "Pending" | "Processed" | "Failed";
}

// Diestel constants
const DIESTEL_CREDIT_LIMIT = 100000; // $100,000 MXN
const DIESTEL_MIN_DAILY_LIMIT = 6000; // $6,000 MXN
const DIESTEL_MAX_DAILY_LIMIT = 8000; // $8,000 MXN

/**
 * Get Diestel service configuration
 */
export async function getDiestelService(user: User | null) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const diestelService = await db
      .select()
      .from(services)
      .where(and(eq(services.serviceCode, "DIESTEL"), eq(services.isActive, true)))
      .limit(1);

    if (diestelService.length === 0) {
      throw new Error("Diestel service not configured");
    }

    return diestelService[0];
  } catch (error) {
    console.error("Get Diestel service error:", error);
    throw new Error("Failed to retrieve Diestel service configuration");
  }
}

/**
 * Check Diestel credit limit status
 * Validates against total credit limit and daily caps
 */
export async function checkDiestelCreditLimit(
  user: User | null,
  requestedAmount: number
): Promise<CreditLimitStatus> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const diestelService = await getDiestelService(user);

    // Get total credit used (all unpaid Diestel transactions)
    const totalCreditResult = await db
      .select({ total: sum(servicePayments.paymentAmount) })
      .from(servicePayments)
      .where(
        and(
          eq(servicePayments.serviceId, diestelService.id),
          eq(servicePayments.status, "Completed")
        )
      );

    const totalCreditUsed = parseFloat(totalCreditResult[0]?.total || "0");

    // Get today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyUsageResult = await db
      .select({ total: sum(servicePayments.paymentAmount) })
      .from(servicePayments)
      .where(
        and(
          eq(servicePayments.serviceId, diestelService.id),
          eq(servicePayments.status, "Completed"),
          gte(servicePayments.createdAt, today)
        )
      );

    const dailyUsed = parseFloat(dailyUsageResult[0]?.total || "0");

    // Calculate remaining limits
    const remainingCredit = DIESTEL_CREDIT_LIMIT - totalCreditUsed;
    const remainingDailyLimit = DIESTEL_MAX_DAILY_LIMIT - dailyUsed;

    // Check if payment can be processed
    const canProcess =
      remainingCredit >= requestedAmount &&
      remainingDailyLimit >= requestedAmount &&
      dailyUsed + requestedAmount <= DIESTEL_MAX_DAILY_LIMIT;

    let message = "";
    if (!canProcess) {
      if (remainingCredit < requestedAmount) {
        message = `Total credit limit exceeded. Available: $${remainingCredit.toFixed(2)}`;
      } else if (dailyUsed + requestedAmount > DIESTEL_MAX_DAILY_LIMIT) {
        message = `Daily limit exceeded. Available today: $${remainingDailyLimit.toFixed(2)}`;
      } else if (dailyUsed + requestedAmount < DIESTEL_MIN_DAILY_LIMIT) {
        message = `Payment amount below minimum daily threshold of $${DIESTEL_MIN_DAILY_LIMIT.toFixed(2)}`;
      }
    }

    return {
      totalCreditUsed,
      creditLimit: DIESTEL_CREDIT_LIMIT,
      remainingCredit,
      dailyUsed,
      dailyLimit: DIESTEL_MAX_DAILY_LIMIT,
      remainingDailyLimit,
      canProcess,
      message,
    };
  } catch (error) {
    console.error("Check credit limit error:", error);
    throw new Error("Failed to check credit limit");
  }
}

/**
 * Process Diestel payment with credit validation
 * Business Rules:
 * - 30-digit reference format validation
 * - Credit limit validation ($100K total, $6K-$8K daily)
 * - No commission for Diestel payments
 * - Creates record for SPEI payment scheduling
 */
export async function processDiestelPayment(
  user: User | null,
  paymentData: DiestelPaymentRequest
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get Diestel service
    const diestelService = await getDiestelService(user);

    // Validate 30-digit reference
    const cleanReference = paymentData.referenceNumber.replace(/[\s-]/g, "");
    if (cleanReference.length !== 30 || !/^\d{30}$/.test(cleanReference)) {
      throw new Error("Invalid Diestel reference. Must be 30 numeric digits.");
    }

    // Check credit limits
    const creditStatus = await checkDiestelCreditLimit(user, paymentData.paymentAmount);

    if (!creditStatus.canProcess) {
      throw new Error(creditStatus.message || "Credit limit validation failed");
    }

    // Create Diestel payment record (no commission for Diestel)
    const payment = await db
      .insert(servicePayments)
      .values({
        serviceId: diestelService.id,
        referenceNumber: cleanReference,
        paymentAmount: paymentData.paymentAmount.toString(),
        commissionAmount: "0", // No commission for Diestel
        customerId: paymentData.customerId || null,
        userId: paymentData.userId,
        branchId: paymentData.branchId,
        status: "Completed",
        completedAt: new Date(),
      })
      .returning();

    return {
      id: payment[0].id,
      transactionId: payment[0].id,
      status: payment[0].status,
      paymentAmount: paymentData.paymentAmount,
      creditStatus: {
        remainingCredit: creditStatus.remainingCredit - paymentData.paymentAmount,
        remainingDailyLimit: creditStatus.remainingDailyLimit - paymentData.paymentAmount,
      },
      message: "Diestel payment processed successfully. Scheduled for SPEI transfer.",
    };
  } catch (error) {
    console.error("Process Diestel payment error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to process Diestel payment"
    );
  }
}

/**
 * Get pending SPEI transfers for Diestel
 * Returns all Diestel payments awaiting SPEI transfer
 */
export async function getPendingSPEITransfers(user: User | null, date?: Date) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const diestelService = await getDiestelService(user);

    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get Diestel payments for the specified date
    const payments = await db
      .select()
      .from(servicePayments)
      .where(
        and(
          eq(servicePayments.serviceId, diestelService.id),
          eq(servicePayments.status, "Completed"),
          gte(servicePayments.createdAt, targetDate),
          sql`${servicePayments.createdAt} < ${nextDay}`
        )
      );

    const totalAmount = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.paymentAmount),
      0
    );

    return {
      scheduledDate: targetDate,
      payments,
      totalAmount,
      transactionCount: payments.length,
      bbvaAccount: "BBVA Account: [To be configured]",
      message: `${payments.length} Diestel payment(s) scheduled for SPEI transfer totaling $${totalAmount.toFixed(2)}`,
    };
  } catch (error) {
    console.error("Get pending SPEI transfers error:", error);
    throw new Error("Failed to retrieve pending SPEI transfers");
  }
}

/**
 * Get Diestel payment statistics
 * Provides overview of credit usage and payment history
 */
export async function getDiestelStatistics(user: User | null) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const diestelService = await getDiestelService(user);

    // Get total payments
    const totalPaymentsResult = await db
      .select({
        count: sql<number>`count(*)`,
        total: sum(servicePayments.paymentAmount),
      })
      .from(servicePayments)
      .where(
        and(
          eq(servicePayments.serviceId, diestelService.id),
          eq(servicePayments.status, "Completed")
        )
      );

    // Get today's payments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPaymentsResult = await db
      .select({
        count: sql<number>`count(*)`,
        total: sum(servicePayments.paymentAmount),
      })
      .from(servicePayments)
      .where(
        and(
          eq(servicePayments.serviceId, diestelService.id),
          eq(servicePayments.status, "Completed"),
          gte(servicePayments.createdAt, today)
        )
      );

    const creditStatus = await checkDiestelCreditLimit(user, 0);

    return {
      totalPayments: {
        count: Number(totalPaymentsResult[0]?.count || 0),
        amount: parseFloat(totalPaymentsResult[0]?.total || "0"),
      },
      todayPayments: {
        count: Number(todayPaymentsResult[0]?.count || 0),
        amount: parseFloat(todayPaymentsResult[0]?.total || "0"),
      },
      creditStatus,
    };
  } catch (error) {
    console.error("Get Diestel statistics error:", error);
    throw new Error("Failed to retrieve Diestel statistics");
  }
}
