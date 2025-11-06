"use server";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import type { User } from "@supabase/supabase-js";
import type { TransactionDetail } from "./transactions";
import { getTransactionById, getTransactionByNumber } from "./transactions";

// Receipt data structure
export interface ReceiptData {
  transactionNumber: string;
  transactionType: string;
  transactionDate: Date;
  customerName?: string;
  accountNumber?: string; // Masked
  referenceNumber?: string;
  amount: number;
  paymentMethod: string;
  items: ReceiptItemData[];
  cashReceived?: number;
  change?: number;
  branchName: string;
  cashierName: string;
  confirmationNumber: string;
}

// Receipt item data
export interface ReceiptItemData {
  description: string;
  amount: number;
  quantity: number;
  referenceNumber?: string;
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

    // Mask account/card numbers (show only last 4 digits)
    const maskedAccountNumber = maskAccountNumber(
      transaction.customerId || ""
    );

    // Generate confirmation number
    const confirmationNumber = generateConfirmationNumber(
      transaction.transactionNumber
    );

    // Build receipt data
    const receiptData: ReceiptData = {
      transactionNumber: transaction.transactionNumber,
      transactionType: formatTransactionType(transaction.transactionType),
      transactionDate: transaction.postedAt || transaction.createdAt,
      accountNumber: maskedAccountNumber,
      amount: transaction.totalAmount,
      paymentMethod: transaction.paymentMethod,
      items: transaction.items.map((item) => ({
        description: item.description,
        amount: item.amount,
        quantity: item.quantity,
        referenceNumber: item.referenceNumber
          ? maskReferenceNumber(item.referenceNumber)
          : undefined,
      })),
      branchName: "Caja Cooperativa", // Would be fetched from branch data
      cashierName: user.email || "Cashier",
      confirmationNumber,
    };

    // Log receipt generation
    await logReceiptGeneration(user, transaction.id, "generated");

    return receiptData;
  } catch (error) {
    console.error("Generate receipt error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate receipt"
    );
  }
}

/**
 * Generate receipt for reprint
 */
export async function reprintReceipt(
  user: User | null,
  transactionNumber: string
): Promise<ReceiptData> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get transaction by number
    const transaction = await getTransactionByNumber(user, transactionNumber);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.transactionStatus !== "Posted") {
      throw new Error("Cannot reprint receipt for non-posted transaction");
    }

    // Mask account/card numbers (show only last 4 digits)
    const maskedAccountNumber = maskAccountNumber(
      transaction.customerId || ""
    );

    // Generate confirmation number
    const confirmationNumber = generateConfirmationNumber(
      transaction.transactionNumber
    );

    // Build receipt data
    const receiptData: ReceiptData = {
      transactionNumber: transaction.transactionNumber,
      transactionType: formatTransactionType(transaction.transactionType),
      transactionDate: transaction.postedAt || transaction.createdAt,
      accountNumber: maskedAccountNumber,
      amount: transaction.totalAmount,
      paymentMethod: transaction.paymentMethod,
      items: transaction.items.map((item) => ({
        description: item.description,
        amount: item.amount,
        quantity: item.quantity,
        referenceNumber: item.referenceNumber
          ? maskReferenceNumber(item.referenceNumber)
          : undefined,
      })),
      branchName: "Caja Cooperativa",
      cashierName: user.email || "Cashier",
      confirmationNumber,
    };

    // Log receipt reprint
    await logReceiptGeneration(user, transaction.id, "reprinted");

    return receiptData;
  } catch (error) {
    console.error("Reprint receipt error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to reprint receipt"
    );
  }
}

/**
 * Format receipt as HTML for printing
 */
export function formatReceiptHTML(receipt: ReceiptData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${receipt.transactionNumber}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          margin: 10mm;
          padding: 0;
          width: 60mm;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 2px solid #000;
          padding-bottom: 5px;
        }
        .header h1 {
          margin: 0;
          font-size: 16px;
        }
        .section {
          margin: 10px 0;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .label {
          font-weight: bold;
        }
        .items {
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
          margin-top: 15px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${receipt.branchName}</h1>
        <p>RECIBO DE TRANSACCIÓN</p>
      </div>

      <div class="section">
        <div class="row">
          <span class="label">Fecha:</span>
          <span>${formatDate(receipt.transactionDate)}</span>
        </div>
        <div class="row">
          <span class="label">Hora:</span>
          <span>${formatTime(receipt.transactionDate)}</span>
        </div>
        <div class="row">
          <span class="label">Transacción:</span>
          <span>${receipt.transactionNumber}</span>
        </div>
        <div class="row">
          <span class="label">Cajero:</span>
          <span>${receipt.cashierName}</span>
        </div>
      </div>

      <div class="section">
        <div class="row">
          <span class="label">Tipo:</span>
          <span>${receipt.transactionType}</span>
        </div>
        ${
          receipt.accountNumber
            ? `<div class="row">
          <span class="label">Cuenta:</span>
          <span>${receipt.accountNumber}</span>
        </div>`
            : ""
        }
        <div class="row">
          <span class="label">Método Pago:</span>
          <span>${receipt.paymentMethod}</span>
        </div>
      </div>

      <div class="items">
        <div class="label">DETALLES:</div>
        ${receipt.items
          .map(
            (item) => `
          <div class="item">
            <div class="row">
              <span>${item.description}</span>
              <span>$${item.amount.toFixed(2)}</span>
            </div>
            ${
              item.referenceNumber
                ? `<div class="row">
              <span style="font-size: 10px;">Ref: ${item.referenceNumber}</span>
            </div>`
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>

      <div class="section total">
        <div class="row">
          <span>TOTAL:</span>
          <span>$${receipt.amount.toFixed(2)}</span>
        </div>
        ${
          receipt.cashReceived
            ? `
          <div class="row">
            <span>Efectivo Recibido:</span>
            <span>$${receipt.cashReceived.toFixed(2)}</span>
          </div>
        `
            : ""
        }
        ${
          receipt.change
            ? `
          <div class="row">
            <span>Cambio:</span>
            <span>$${receipt.change.toFixed(2)}</span>
          </div>
        `
            : ""
        }
      </div>

      <div class="footer">
        <p>Confirmación: ${receipt.confirmationNumber}</p>
        <p>Gracias por su preferencia</p>
        <p>Conserve este recibo</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Format receipt as plain text for printing
 */
export function formatReceiptText(receipt: ReceiptData): string {
  const lines: string[] = [];
  const width = 40;

  // Header
  lines.push(centerText(receipt.branchName, width));
  lines.push(centerText("RECIBO DE TRANSACCIÓN", width));
  lines.push(repeatChar("=", width));

  // Transaction info
  lines.push(`Fecha: ${formatDate(receipt.transactionDate)}`);
  lines.push(`Hora: ${formatTime(receipt.transactionDate)}`);
  lines.push(`Transacción: ${receipt.transactionNumber}`);
  lines.push(`Cajero: ${receipt.cashierName}`);
  lines.push(repeatChar("-", width));

  // Transaction details
  lines.push(`Tipo: ${receipt.transactionType}`);
  if (receipt.accountNumber) {
    lines.push(`Cuenta: ${receipt.accountNumber}`);
  }
  lines.push(`Método Pago: ${receipt.paymentMethod}`);
  lines.push(repeatChar("-", width));

  // Items
  lines.push("DETALLES:");
  receipt.items.forEach((item) => {
    lines.push(
      `${item.description.padEnd(25)} $${item.amount.toFixed(2).padStart(10)}`
    );
    if (item.referenceNumber) {
      lines.push(`  Ref: ${item.referenceNumber}`);
    }
  });
  lines.push(repeatChar("-", width));

  // Total
  lines.push(
    `TOTAL:${" ".repeat(25)}$${receipt.amount.toFixed(2).padStart(10)}`
  );
  if (receipt.cashReceived) {
    lines.push(
      `Efectivo Recibido:${" ".repeat(15)}$${receipt.cashReceived.toFixed(2).padStart(10)}`
    );
  }
  if (receipt.change) {
    lines.push(
      `Cambio:${" ".repeat(24)}$${receipt.change.toFixed(2).padStart(10)}`
    );
  }
  lines.push(repeatChar("=", width));

  // Footer
  lines.push(centerText(`Confirmación: ${receipt.confirmationNumber}`, width));
  lines.push(centerText("Gracias por su preferencia", width));
  lines.push(centerText("Conserve este recibo", width));

  return lines.join("\n");
}

/**
 * Mask account/card number (show only last 4 digits)
 */
function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) {
    return "****";
  }
  const last4 = accountNumber.slice(-4);
  const masked = "*".repeat(Math.max(accountNumber.length - 4, 4));
  return `${masked}${last4}`;
}

/**
 * Mask reference number (show first 4 and last 4 digits)
 */
function maskReferenceNumber(referenceNumber: string): string {
  if (!referenceNumber || referenceNumber.length <= 8) {
    return referenceNumber;
  }
  const first4 = referenceNumber.slice(0, 4);
  const last4 = referenceNumber.slice(-4);
  const masked = "*".repeat(Math.max(referenceNumber.length - 8, 4));
  return `${first4}${masked}${last4}`;
}

/**
 * Generate confirmation number
 */
function generateConfirmationNumber(transactionNumber: string): string {
  // Generate a simple confirmation number based on transaction number
  const hash = transactionNumber
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `CONF-${hash.toString().padStart(8, "0")}`;
}

/**
 * Format transaction type for display
 */
function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    ServicePayment: "Pago de Servicios",
    CardPayment: "Pago de Tarjeta",
    DiestelPayment: "Pago Diestel",
    CashDeposit: "Depósito en Efectivo",
    CashWithdrawal: "Retiro en Efectivo",
  };
  return typeMap[type] || type;
}

/**
 * Format date for receipt
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

/**
 * Format time for receipt
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

/**
 * Center text within a given width
 */
function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(padding) + text;
}

/**
 * Repeat character n times
 */
function repeatChar(char: string, count: number): string {
  return char.repeat(count);
}

/**
 * Log receipt generation to audit trail
 */
async function logReceiptGeneration(
  user: User,
  transactionId: string,
  action: "generated" | "reprinted"
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: user.id,
      action: `receipt_${action}`,
      entityType: "transaction",
      entityId: transactionId,
      changes: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
      }),
      ipAddress: "127.0.0.1", // Would be retrieved from request
      userAgent: "Cashier System", // Would be retrieved from request
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to log receipt generation:", error);
    // Don't throw error, just log it
  }
}
