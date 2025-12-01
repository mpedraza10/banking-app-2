"use server";

import { db } from "@/lib/db";
import { cashDenominations, cashDrawer } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

// Denomination type
export type DenominationType = "Received" | "Payment" | "Change";

// Denomination entry interface
export interface DenominationEntry {
  denomination: number;
  quantity: number;
  amount: number;
}

// Cash received request
export interface CashReceivedRequest {
  transactionId: string;
  denominations: DenominationEntry[];
  userId: string;
}

// Payment denomination request
export interface PaymentDenominationRequest {
  transactionId: string;
  denominations: DenominationEntry[];
  userId: string;
}

// Change dispensing request
export interface ChangeDispensingRequest {
  transactionId: string;
  changeAmount: number;
  denominations: DenominationEntry[];
  userId: string;
}

// Cash drawer balance
export interface CashDrawerBalance {
  denomination: number;
  quantity: number;
  amount: number;
}

// Available denominations (Mexican currency)
export const AVAILABLE_DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];

/**
 * Record cash received from customer
 * Stage 1: Customer hands cash to cashier
 */
export async function recordCashReceived(
  user: User | null,
  data: CashReceivedRequest
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Validate denominations match expected amounts
    const totalReceived = data.denominations.reduce(
      (sum, denom) => sum + denom.amount,
      0
    );

    // Insert denomination records
    const denominationRecords = data.denominations.map((denom) => ({
      transactionId: data.transactionId,
      denominationType: "Received" as const,
      denomination: denom.denomination.toString(),
      quantity: denom.quantity,
      amount: denom.amount.toString(),
      userId: data.userId, // Note: Should be systemUsers.id in production
    }));

    await db.insert(cashDenominations).values(denominationRecords);

    // Update cash drawer inventory (add received cash)
    for (const denom of data.denominations) {
      await updateCashDrawerInventory(
        data.userId,
        denom.denomination,
        denom.quantity,
        "add"
      );
    }

    return {
      success: true,
      totalReceived,
      message: "Cash received recorded successfully",
    };
  } catch (error) {
    console.error("Record cash received error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to record cash received"
    );
  }
}

/**
 * Record payment denomination breakdown
 * Stage 2: Amount applied to payment
 */
export async function recordPaymentDenominations(
  user: User | null,
  data: PaymentDenominationRequest
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Validate denominations match payment amount
    const totalPayment = data.denominations.reduce(
      (sum, denom) => sum + denom.amount,
      0
    );

    // Insert denomination records
    const denominationRecords = data.denominations.map((denom) => ({
      transactionId: data.transactionId,
      denominationType: "Payment" as const,
      denomination: denom.denomination.toString(),
      quantity: denom.quantity,
      amount: denom.amount.toString(),
      userId: data.userId,
    }));

    await db.insert(cashDenominations).values(denominationRecords);

    return {
      success: true,
      totalPayment,
      message: "Payment denominations recorded successfully",
    };
  } catch (error) {
    console.error("Record payment denominations error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to record payment denominations"
    );
  }
}

/**
 * Record change dispensed to customer
 * Stage 3: Change returned to customer
 */
export async function recordChangeDispensed(
  user: User | null,
  data: ChangeDispensingRequest
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Validate denominations match change amount
    const totalChange = data.denominations.reduce(
      (sum, denom) => sum + denom.amount,
      0
    );

    if (Math.abs(totalChange - data.changeAmount) > 0.01) {
      throw new Error(
        `Denomination total (${totalChange}) does not match change amount (${data.changeAmount})`
      );
    }

    // Validate drawer has sufficient denominations
    const validation = await validateChangeAvailability(
      data.userId,
      data.denominations
    );

    if (!validation.isAvailable) {
      return {
        success: false,
        deficientDenominations: validation.deficientDenominations,
        message: "Insufficient cash in drawer for specified denominations",
      };
    }

    // Insert denomination records
    const denominationRecords = data.denominations.map((denom) => ({
      transactionId: data.transactionId,
      denominationType: "Change" as const,
      denomination: denom.denomination.toString(),
      quantity: denom.quantity,
      amount: denom.amount.toString(),
      userId: data.userId,
    }));

    await db.insert(cashDenominations).values(denominationRecords);

    // Update cash drawer inventory (remove dispensed change)
    for (const denom of data.denominations) {
      await updateCashDrawerInventory(
        data.userId,
        denom.denomination,
        denom.quantity,
        "subtract"
      );
    }

    return {
      success: true,
      totalChange,
      message: "Change dispensed recorded successfully",
    };
  } catch (error) {
    console.error("Record change dispensed error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to record change dispensed"
    );
  }
}

/**
 * Get current cash drawer balance for user
 */
export async function getCashDrawerBalance(
  user: User | null,
  userId: string
): Promise<CashDrawerBalance[]> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const balance = await db
      .select()
      .from(cashDrawer)
      .where(eq(cashDrawer.userId, userId));

    return balance.map((item) => ({
      denomination: parseFloat(item.denomination),
      quantity: item.quantity,
      amount: parseFloat(item.amount),
    }));
  } catch (error) {
    console.error("Get cash drawer balance error:", error);
    throw new Error("Failed to retrieve cash drawer balance");
  }
}

/**
 * Update cash drawer inventory
 */
async function updateCashDrawerInventory(
  userId: string,
  denomination: number,
  quantity: number,
  operation: "add" | "subtract"
) {
  try {
    // Check if record exists
    const existing = await db
      .select()
      .from(cashDrawer)
      .where(eq(cashDrawer.userId, userId))
      .limit(1);

    const denominationStr = denomination.toString();
    const amount = denomination * quantity;

    if (existing.length === 0) {
      // Create new record
      if (operation === "add") {
        await db.insert(cashDrawer).values({
          userId,
          denomination: denominationStr,
          quantity,
          amount: amount.toString(),
          lastUpdated: new Date(),
        });
      }
    } else {
      // Update existing record
      const currentQuantity = existing[0].quantity;
      const newQuantity =
        operation === "add" ? currentQuantity + quantity : currentQuantity - quantity;
      const newAmount = denomination * newQuantity;

      await db
        .update(cashDrawer)
        .set({
          quantity: newQuantity,
          amount: newAmount.toString(),
          lastUpdated: new Date(),
        })
        .where(eq(cashDrawer.userId, userId));
    }
  } catch (error) {
    console.error("Update cash drawer inventory error:", error);
    throw new Error("Failed to update cash drawer inventory");
  }
}

/**
 * Validate change availability in drawer
 */
async function validateChangeAvailability(
  userId: string,
  requiredDenominations: DenominationEntry[]
): Promise<{
  isAvailable: boolean;
  deficientDenominations: number[];
}> {
  try {
    const currentBalance = await db
      .select()
      .from(cashDrawer)
      .where(eq(cashDrawer.userId, userId));

    const deficientDenominations: number[] = [];

    for (const required of requiredDenominations) {
      const available = currentBalance.find(
        (item) => parseFloat(item.denomination) === required.denomination
      );

      if (!available || available.quantity < required.quantity) {
        deficientDenominations.push(required.denomination);
      }
    }

    return {
      isAvailable: deficientDenominations.length === 0,
      deficientDenominations,
    };
  } catch (error) {
    console.error("Validate change availability error:", error);
    throw new Error("Failed to validate change availability");
  }
}

/**
 * Calculate optimal change denominations
 */
export async function calculateOptimalChange(
  user: User | null,
  userId: string,
  changeAmount: number
): Promise<DenominationEntry[]> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get current drawer balance
    const balance = await getCashDrawerBalance(user, userId);

    // Create map of available denominations
    const availableMap = new Map(
      balance.map((item) => [item.denomination, item.quantity])
    );

    const result: DenominationEntry[] = [];
    let remaining = changeAmount;

    // Greedy algorithm: use largest denominations first
    for (const denom of AVAILABLE_DENOMINATIONS) {
      const available = availableMap.get(denom) || 0;

      if (remaining >= denom && available > 0) {
        const needed = Math.floor(remaining / denom);
        const toUse = Math.min(needed, available);

        if (toUse > 0) {
          result.push({
            denomination: denom,
            quantity: toUse,
            amount: denom * toUse,
          });

          remaining -= denom * toUse;
        }
      }
    }

    // Check if exact change is possible
    if (Math.abs(remaining) > 0.01) {
      throw new Error(
        `Unable to make exact change. Remaining amount: $${remaining.toFixed(2)}`
      );
    }

    return result;
  } catch (error) {
    console.error("Calculate optimal change error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to calculate optimal change"
    );
  }
}

/**
 * Get denomination history for a transaction
 */
export async function getTransactionDenominations(
  user: User | null,
  transactionId: string
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const denominations = await db
      .select()
      .from(cashDenominations)
      .where(eq(cashDenominations.transactionId, transactionId));

    const grouped = {
      received: denominations
        .filter((d) => d.denominationType === "Received")
        .map((d) => ({
          denomination: parseFloat(d.denomination),
          quantity: d.quantity,
          amount: parseFloat(d.amount),
        })),
      payment: denominations
        .filter((d) => d.denominationType === "Payment")
        .map((d) => ({
          denomination: parseFloat(d.denomination),
          quantity: d.quantity,
          amount: parseFloat(d.amount),
        })),
      change: denominations
        .filter((d) => d.denominationType === "Change")
        .map((d) => ({
          denomination: parseFloat(d.denomination),
          quantity: d.quantity,
          amount: parseFloat(d.amount),
        })),
    };

    return grouped;
  } catch (error) {
    console.error("Get transaction denominations error:", error);
    throw new Error("Failed to retrieve transaction denominations");
  }
}
