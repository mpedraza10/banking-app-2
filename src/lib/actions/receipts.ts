"use server";

import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import type { TransactionDetail } from "./transactions";

// Receipt generation request
export interface GenerateReceiptRequest {
  transactionId: string;
  transactionDetail: TransactionDetail;
  cashReceived?: number;
  changeGiven?: number;
  denominationDetails?: Record<string, unknown>;
}

// Receipt data structure
export interface ReceiptData {
  id: string;
  receiptNumber: string;
  transactionId: string;
  transactionNumber: string;
  transactionType: string;
  transactionDate: Date;
  totalAmount: number;
  paymentMethod: string;
  cashReceived?: number;
  changeGiven?: number;
  customerInfo?: {
    id?: string;
    name?: string;
    accountNumber?: string; // Masked
  };
  items: ReceiptItem[];
  branchId: string;
  userId: string;
  printedAt?: Date;
  reprintCount: number;
}

// Receipt item structure
export interface ReceiptItem {
  description: string;
  amount: number;
  quantity: number;
  referenceNumber?: string; // Masked if sensitive
}

/**
 * Generate a new receipt for a transaction
 */
export async function generateReceipt(
  user: User | null,
  data: GenerateReceiptRequest
): Promise<ReceiptData> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const { transactionDetail } = data;

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Mask sensitive data
    const maskedCustomerInfo = transactionDetail.customerId
      ? {
          id: transactionDetail.customerId,
          name: transactionDetail.customerName,
          accountNumber: maskAccountNumber(transactionDetail.customerId),
        }
      : undefined;

    // Prepare receipt items with masked references
    const receiptItems: ReceiptItem[] = transactionDetail.items.map((item) => ({
      description: item.description,
      amount: item.amount,
      quantity: item.quantity,
      referenceNumber: item.referenceNumber
        ? maskReferenceNumber(item.referenceNumber)
        : undefined,
    }));

    // Insert receipt record
    const [newReceipt] = await db
      .insert(receipts)
      .values({
        receiptNumber,
        transactionId: transactionDetail.id,
        receiptData: JSON.stringify({
          transactionNumber: transactionDetail.transactionNumber,
          transactionType: transactionDetail.transactionType,
          transactionDate: transactionDetail.createdAt,
          totalAmount: transactionDetail.totalAmount,
          paymentMethod: transactionDetail.paymentMethod,
          cashReceived: data.cashReceived,
          changeGiven: data.changeGiven,
          customerInfo: maskedCustomerInfo,
          items: receiptItems,
          denominationDetails: data.denominationDetails,
        }),
        printedAt: new Date(),
        reprintCount: 0,
      })
      .returning();

    return {
      id: newReceipt.id,
      receiptNumber: newReceipt.receiptNumber,
      transactionId: transactionDetail.id,
      transactionNumber: transactionDetail.transactionNumber,
      transactionType: transactionDetail.transactionType,
      transactionDate: transactionDetail.createdAt,
      totalAmount: transactionDetail.totalAmount,
      paymentMethod: transactionDetail.paymentMethod,
      cashReceived: data.cashReceived,
      changeGiven: data.changeGiven,
      customerInfo: maskedCustomerInfo,
      items: receiptItems,
      branchId: transactionDetail.branchId,
      userId: transactionDetail.userId,
      printedAt: newReceipt.printedAt || undefined,
      reprintCount: newReceipt.reprintCount,
    };
  } catch (error) {
    console.error("Generate receipt error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate receipt"
    );
  }
}

/**
 * Get receipt by transaction ID
 */
export async function getReceiptByTransactionId(
  user: User | null,
  transactionId: string
): Promise<ReceiptData | null> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(eq(receipts.transactionId, transactionId))
      .limit(1);

    if (!receipt) {
      return null;
    }

    const receiptData = JSON.parse(receipt.receiptData);

    return {
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      transactionId: receipt.transactionId,
      transactionNumber: receiptData.transactionNumber,
      transactionType: receiptData.transactionType,
      transactionDate: new Date(receiptData.transactionDate),
      totalAmount: receiptData.totalAmount,
      paymentMethod: receiptData.paymentMethod,
      cashReceived: receiptData.cashReceived,
      changeGiven: receiptData.changeGiven,
      customerInfo: receiptData.customerInfo,
      items: receiptData.items || [],
      branchId: receiptData.branchId || "",
      userId: receiptData.userId || "",
      printedAt: receipt.printedAt || undefined,
      reprintCount: receipt.reprintCount,
    };
  } catch (error) {
    console.error("Get receipt by transaction ID error:", error);
    throw new Error("Failed to retrieve receipt");
  }
}

/**
 * Get receipt by receipt number
 */
export async function getReceiptByNumber(
  user: User | null,
  receiptNumber: string
): Promise<ReceiptData | null> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(eq(receipts.receiptNumber, receiptNumber))
      .limit(1);

    if (!receipt) {
      return null;
    }

    const receiptData = JSON.parse(receipt.receiptData);

    return {
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      transactionId: receipt.transactionId,
      transactionNumber: receiptData.transactionNumber,
      transactionType: receiptData.transactionType,
      transactionDate: new Date(receiptData.transactionDate),
      totalAmount: receiptData.totalAmount,
      paymentMethod: receiptData.paymentMethod,
      cashReceived: receiptData.cashReceived,
      changeGiven: receiptData.changeGiven,
      customerInfo: receiptData.customerInfo,
      items: receiptData.items || [],
      branchId: receiptData.branchId || "",
      userId: receiptData.userId || "",
      printedAt: receipt.printedAt || undefined,
      reprintCount: receipt.reprintCount,
    };
  } catch (error) {
    console.error("Get receipt by number error:", error);
    throw new Error("Failed to retrieve receipt");
  }
}

/**
 * Reprint receipt - increments reprint count for audit trail
 */
export async function reprintReceipt(
  user: User | null,
  receiptId: string
): Promise<ReceiptData> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get current receipt
    const [currentReceipt] = await db
      .select()
      .from(receipts)
      .where(eq(receipts.id, receiptId))
      .limit(1);

    if (!currentReceipt) {
      throw new Error("Receipt not found");
    }

    // Increment reprint count
    const [updatedReceipt] = await db
      .update(receipts)
      .set({
        reprintCount: currentReceipt.reprintCount + 1,
      })
      .where(eq(receipts.id, receiptId))
      .returning();

    const receiptData = JSON.parse(updatedReceipt.receiptData);

    return {
      id: updatedReceipt.id,
      receiptNumber: updatedReceipt.receiptNumber,
      transactionId: updatedReceipt.transactionId,
      transactionNumber: receiptData.transactionNumber,
      transactionType: receiptData.transactionType,
      transactionDate: new Date(receiptData.transactionDate),
      totalAmount: receiptData.totalAmount,
      paymentMethod: receiptData.paymentMethod,
      cashReceived: receiptData.cashReceived,
      changeGiven: receiptData.changeGiven,
      customerInfo: receiptData.customerInfo,
      items: receiptData.items || [],
      branchId: receiptData.branchId || "",
      userId: receiptData.userId || "",
      printedAt: updatedReceipt.printedAt || undefined,
      reprintCount: updatedReceipt.reprintCount,
    };
  } catch (error) {
    console.error("Reprint receipt error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to reprint receipt"
    );
  }
}

/**
 * Generate unique receipt number
 */
async function generateReceiptNumber(): Promise<string> {
  // Format: RCP-YYYYMMDD-NNNNNN
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

  // Get count of receipts for today
  const todayStart = new Date(date.setHours(0, 0, 0, 0));
  const todayEnd = new Date(date.setHours(23, 59, 59, 999));

  const allReceipts = await db.select().from(receipts);

  const todayCount = allReceipts.filter((r) => {
    const printedAt = r.printedAt;
    return printedAt && printedAt >= todayStart && printedAt <= todayEnd;
  }).length;

  const sequence = String(todayCount + 1).padStart(6, "0");

  return `RCP-${dateStr}-${sequence}`;
}

/**
 * Mask account number - show only last 4 digits
 */
function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) {
    return "****";
  }
  const lastFour = accountNumber.slice(-4);
  const masked = "*".repeat(Math.max(0, accountNumber.length - 4));
  return `${masked}${lastFour}`;
}

/**
 * Mask reference number - show only last 4 digits
 */
function maskReferenceNumber(referenceNumber: string): string {
  if (!referenceNumber || referenceNumber.length < 4) {
    return "****";
  }
  const lastFour = referenceNumber.slice(-4);
  const masked = "*".repeat(Math.max(0, referenceNumber.length - 4));
  return `${masked}${lastFour}`;
}

/**
 * Format receipt for printing/display
 */
export async function formatReceiptForDisplay(receipt: ReceiptData): Promise<string> {
  const lines: string[] = [];

  lines.push("=====================================");
  lines.push("          CAJA COOPERATIVA");
  lines.push("=====================================");
  lines.push("");
  lines.push(`Receipt: ${receipt.receiptNumber}`);
  lines.push(`Transaction: ${receipt.transactionNumber}`);
  lines.push(`Date: ${receipt.transactionDate.toLocaleString()}`);
  lines.push(`Type: ${receipt.transactionType}`);
  lines.push("");

  if (receipt.customerInfo) {
    lines.push("Customer Information:");
    if (receipt.customerInfo.name) {
      lines.push(`  Name: ${receipt.customerInfo.name}`);
    }
    if (receipt.customerInfo.accountNumber) {
      lines.push(`  Account: ${receipt.customerInfo.accountNumber}`);
    }
    lines.push("");
  }

  lines.push("Items:");
  lines.push("-------------------------------------");
  receipt.items.forEach((item) => {
    lines.push(`${item.description}`);
    lines.push(`  Qty: ${item.quantity} x $${item.amount.toFixed(2)}`);
    if (item.referenceNumber) {
      lines.push(`  Ref: ${item.referenceNumber}`);
    }
  });
  lines.push("-------------------------------------");
  lines.push("");

  lines.push(`Total Amount: $${receipt.totalAmount.toFixed(2)}`);
  lines.push(`Payment Method: ${receipt.paymentMethod}`);

  if (receipt.cashReceived) {
    lines.push(`Cash Received: $${receipt.cashReceived.toFixed(2)}`);
  }
  if (receipt.changeGiven) {
    lines.push(`Change Given: $${receipt.changeGiven.toFixed(2)}`);
  }

  lines.push("");
  lines.push("=====================================");
  lines.push("        Thank you for your visit!");
  lines.push("=====================================");

  if (receipt.reprintCount > 0) {
    lines.push("");
    lines.push(`REPRINT #${receipt.reprintCount}`);
  }

  return lines.join("\n");
}
