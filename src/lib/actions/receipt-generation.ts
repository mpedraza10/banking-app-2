"use server";

import type { User } from "@supabase/supabase-js";
import { getTransactionById, type TransactionDetail } from "./transactions";
import { db } from "@/lib/db";
import { receiptPrintLog } from "@/lib/db/schema";

// Receipt data structure
export interface ReceiptData {
  transactionNumber: string;
  transactionType: string;
  transactionDate: Date;
  branchName: string;
  cashierName: string;
  customerName?: string;
  accountNumber?: string; // Masked
  referenceNumber?: string;
  items: ReceiptItem[];
  totalAmount: number;
  paymentMethod: string;
  cashReceived?: number;
  changeAmount?: number;
  confirmationNumber: string;
  receiptNumber: string;
}

// Receipt item structure
export interface ReceiptItem {
  description: string;
  quantity: number;
  amount: number;
  subtotal: number;
}

/**
 * Generate receipt data from transaction
 */
export async function generateReceipt(
  user: User | null,
  transactionId: string
): Promise<ReceiptData> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get transaction details
    const transaction = await getTransactionById(user, transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.transactionStatus !== "Posted") {
      throw new Error("Cannot generate receipt for non-posted transaction");
    }

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Format receipt items
    const items: ReceiptItem[] = transaction.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amount: item.amount,
      subtotal: item.amount * item.quantity,
    }));

    // Get metadata from first item if exists
    const metadata = transaction.items[0]?.metadata as
      | {
          cashReceived?: number;
          changeAmount?: number;
          accountNumber?: string;
        }
      | undefined;

    // Mask account number if present
    const maskedAccountNumber = metadata?.accountNumber
      ? maskAccountNumber(metadata.accountNumber)
      : undefined;

    const receiptData: ReceiptData = {
      transactionNumber: transaction.transactionNumber,
      transactionType: formatTransactionType(transaction.transactionType),
      transactionDate: transaction.postedAt || transaction.createdAt,
      branchName: "Branch Name", // TODO: Get from branch data
      cashierName: user.email || "Cashier",
      customerName: transaction.customerId,
      accountNumber: maskedAccountNumber,
      referenceNumber: transaction.items[0]?.referenceNumber,
      items,
      totalAmount: transaction.totalAmount,
      paymentMethod: transaction.paymentMethod,
      cashReceived: metadata?.cashReceived,
      changeAmount: metadata?.changeAmount,
      confirmationNumber: transaction.transactionNumber,
      receiptNumber,
    };

    // Log receipt generation
    await logReceiptPrint(user, transactionId, receiptNumber, false);

    return receiptData;
  } catch (error) {
    console.error("Generate receipt error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate receipt"
    );
  }
}

/**
 * Reprint receipt for completed transaction
 */
export async function reprintReceipt(
  user: User | null,
  transactionId: string
): Promise<ReceiptData> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get transaction details
    const transaction = await getTransactionById(user, transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.transactionStatus !== "Posted") {
      throw new Error("Cannot reprint receipt for non-posted transaction");
    }

    // Get original receipt number from print log
    const printLogs = await db
      .select()
      .from(receiptPrintLog)
      .where((log) => log.transactionId === transactionId)
      .orderBy((log) => log.printedAt)
      .limit(1);

    const receiptNumber =
      printLogs.length > 0 ? printLogs[0].receiptNumber : await generateReceiptNumber();

    // Format receipt items
    const items: ReceiptItem[] = transaction.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amount: item.amount,
      subtotal: item.amount * item.quantity,
    }));

    // Get metadata from first item if exists
    const metadata = transaction.items[0]?.metadata as
      | {
          cashReceived?: number;
          changeAmount?: number;
          accountNumber?: string;
        }
      | undefined;

    // Mask account number if present
    const maskedAccountNumber = metadata?.accountNumber
      ? maskAccountNumber(metadata.accountNumber)
      : undefined;

    const receiptData: ReceiptData = {
      transactionNumber: transaction.transactionNumber,
      transactionType: formatTransactionType(transaction.transactionType),
      transactionDate: transaction.postedAt || transaction.createdAt,
      branchName: "Branch Name", // TODO: Get from branch data
      cashierName: user.email || "Cashier",
      customerName: transaction.customerId,
      accountNumber: maskedAccountNumber,
      referenceNumber: transaction.items[0]?.referenceNumber,
      items,
      totalAmount: transaction.totalAmount,
      paymentMethod: transaction.paymentMethod,
      cashReceived: metadata?.cashReceived,
      changeAmount: metadata?.changeAmount,
      confirmationNumber: transaction.transactionNumber,
      receiptNumber,
    };

    // Log receipt reprint
    await logReceiptPrint(user, transactionId, receiptNumber, true);

    return receiptData;
  } catch (error) {
    console.error("Reprint receipt error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to reprint receipt"
    );
  }
}

/**
 * Format receipt as printable HTML
 */
export function formatReceiptHTML(receipt: ReceiptData): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt ${receipt.receiptNumber}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-width: 300px;
      margin: 0 auto;
      padding: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
    }
    .section {
      margin: 15px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }
    .label {
      font-weight: bold;
    }
    .items {
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 10px 0;
      margin: 10px 0;
    }
    .item {
      margin: 5px 0;
    }
    .total {
      font-size: 14px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      border-top: 2px solid #000;
      padding-top: 10px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Caja Cooperativa</h1>
    <div>${receipt.branchName}</div>
  </div>

  <div class="section">
    <div class="row">
      <span class="label">Recibo:</span>
      <span>${receipt.receiptNumber}</span>
    </div>
    <div class="row">
      <span class="label">Transacción:</span>
      <span>${receipt.transactionNumber}</span>
    </div>
    <div class="row">
      <span class="label">Fecha:</span>
      <span>${formatDate(receipt.transactionDate)}</span>
    </div>
    <div class="row">
      <span class="label">Tipo:</span>
      <span>${receipt.transactionType}</span>
    </div>
    <div class="row">
      <span class="label">Cajero:</span>
      <span>${receipt.cashierName}</span>
    </div>
  </div>

  ${
    receipt.customerName || receipt.accountNumber
      ? `
  <div class="section">
    ${receipt.customerName ? `<div class="row"><span class="label">Cliente:</span><span>${receipt.customerName}</span></div>` : ""}
    ${receipt.accountNumber ? `<div class="row"><span class="label">Cuenta:</span><span>${receipt.accountNumber}</span></div>` : ""}
    ${receipt.referenceNumber ? `<div class="row"><span class="label">Referencia:</span><span>${receipt.referenceNumber}</span></div>` : ""}
  </div>
  `
      : ""
  }

  <div class="items">
    ${receipt.items
      .map(
        (item) => `
    <div class="item">
      <div>${item.description}</div>
      <div class="row">
        <span>${item.quantity} x $${item.amount.toFixed(2)}</span>
        <span>$${item.subtotal.toFixed(2)}</span>
      </div>
    </div>
    `
      )
      .join("")}
  </div>

  <div class="section">
    <div class="row total">
      <span>TOTAL:</span>
      <span>$${receipt.totalAmount.toFixed(2)}</span>
    </div>
    <div class="row">
      <span class="label">Método de Pago:</span>
      <span>${receipt.paymentMethod}</span>
    </div>
    ${
      receipt.cashReceived
        ? `
    <div class="row">
      <span class="label">Efectivo Recibido:</span>
      <span>$${receipt.cashReceived.toFixed(2)}</span>
    </div>
    `
        : ""
    }
    ${
      receipt.changeAmount
        ? `
    <div class="row">
      <span class="label">Cambio:</span>
      <span>$${receipt.changeAmount.toFixed(2)}</span>
    </div>
    `
        : ""
    }
  </div>

  <div class="footer">
    <div>Confirmación: ${receipt.confirmationNumber}</div>
    <div style="margin-top: 10px;">¡Gracias por su preferencia!</div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Format receipt as plain text
 */
export function formatReceiptText(receipt: ReceiptData): string {
  const lines: string[] = [];
  const width = 40;

  // Header
  lines.push("=".repeat(width));
  lines.push(centerText("Caja Cooperativa", width));
  lines.push(centerText(receipt.branchName, width));
  lines.push("=".repeat(width));
  lines.push("");

  // Transaction info
  lines.push(`Recibo: ${receipt.receiptNumber}`);
  lines.push(`Transacción: ${receipt.transactionNumber}`);
  lines.push(`Fecha: ${formatDate(receipt.transactionDate)}`);
  lines.push(`Tipo: ${receipt.transactionType}`);
  lines.push(`Cajero: ${receipt.cashierName}`);
  lines.push("");

  // Customer info
  if (receipt.customerName || receipt.accountNumber) {
    if (receipt.customerName) lines.push(`Cliente: ${receipt.customerName}`);
    if (receipt.accountNumber) lines.push(`Cuenta: ${receipt.accountNumber}`);
    if (receipt.referenceNumber) lines.push(`Referencia: ${receipt.referenceNumber}`);
    lines.push("");
  }

  // Items
  lines.push("-".repeat(width));
  receipt.items.forEach((item) => {
    lines.push(item.description);
    lines.push(
      padRight(
        `${item.quantity} x $${item.amount.toFixed(2)}`,
        width - 10
      ) + padLeft(`$${item.subtotal.toFixed(2)}`, 10)
    );
  });
  lines.push("-".repeat(width));
  lines.push("");

  // Total
  lines.push(
    padRight("TOTAL:", width - 12) +
      padLeft(`$${receipt.totalAmount.toFixed(2)}`, 12)
  );
  lines.push(`Método de Pago: ${receipt.paymentMethod}`);
  if (receipt.cashReceived) {
    lines.push(
      padRight("Efectivo Recibido:", width - 12) +
        padLeft(`$${receipt.cashReceived.toFixed(2)}`, 12)
    );
  }
  if (receipt.changeAmount) {
    lines.push(
      padRight("Cambio:", width - 12) +
        padLeft(`$${receipt.changeAmount.toFixed(2)}`, 12)
    );
  }
  lines.push("");

  // Footer
  lines.push("=".repeat(width));
  lines.push(`Confirmación: ${receipt.confirmationNumber}`);
  lines.push(centerText("¡Gracias por su preferencia!", width));
  lines.push("=".repeat(width));

  return lines.join("\n");
}

/**
 * Helper: Mask account/card number (show only last 4 digits)
 */
function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }
  const lastFour = accountNumber.slice(-4);
  const masked = "*".repeat(accountNumber.length - 4);
  return masked + lastFour;
}

/**
 * Helper: Format transaction type for display
 */
function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    ServicePayment: "Pago de Servicio",
    CardPayment: "Pago de Tarjeta",
    DiestelPayment: "Pago Diestel",
    CashDeposit: "Depósito en Efectivo",
    CashWithdrawal: "Retiro en Efectivo",
  };
  return typeMap[type] || type;
}

/**
 * Helper: Format date for receipt
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Helper: Generate unique receipt number
 */
async function generateReceiptNumber(): Promise<string> {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = date.toISOString().slice(11, 19).replace(/:/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `REC-${dateStr}-${timeStr}-${random}`;
}

/**
 * Helper: Log receipt print activity
 */
async function logReceiptPrint(
  user: User,
  transactionId: string,
  receiptNumber: string,
  isReprint: boolean
): Promise<void> {
  try {
    await db.insert(receiptPrintLog).values({
      transactionId,
      receiptNumber,
      printedBy: user.id,
      printedAt: new Date(),
      isReprint,
    });
  } catch (error) {
    console.error("Log receipt print error:", error);
    // Don't throw - logging failure shouldn't prevent receipt generation
  }
}

/**
 * Helper: Center text within width
 */
function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(padding) + text;
}

/**
 * Helper: Pad text to the right
 */
function padRight(text: string, width: number): string {
  return text + " ".repeat(Math.max(0, width - text.length));
}

/**
 * Helper: Pad text to the left
 */
function padLeft(text: string, width: number): string {
  return " ".repeat(Math.max(0, width - text.length)) + text;
}
