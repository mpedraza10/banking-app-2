import type { TransactionDetail } from "@/lib/actions/transactions";

// Receipt data structure
export interface ReceiptData {
  transactionNumber: string;
  transactionType: string;
  transactionDate: Date;
  branchName?: string;
  cashierName?: string;
  customerInfo?: {
    name?: string;
    accountNumber?: string;
    cardNumber?: string;
  };
  items: ReceiptItem[];
  subtotal: number;
  commission?: number;
  totalAmount: number;
  paymentMethod: string;
  cashReceived?: number;
  changeGiven?: number;
  referenceNumber?: string;
  additionalInfo?: Record<string, string>;
}

// Receipt item structure
export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metadata?: Record<string, unknown>;
}

/**
 * Generate receipt data from transaction
 */
export function generateReceiptData(
  transaction: TransactionDetail,
  additionalData?: {
    branchName?: string;
    cashierName?: string;
    customerName?: string;
    accountNumber?: string;
    cardNumber?: string;
    cashReceived?: number;
    changeGiven?: number;
    commission?: number;
  }
): ReceiptData {
  // Map transaction items to receipt items
  const items: ReceiptItem[] = transaction.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.amount / item.quantity,
    total: item.amount,
    metadata: item.metadata,
  }));

  // Calculate subtotal (sum of all items)
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const receipt: ReceiptData = {
    transactionNumber: transaction.transactionNumber,
    transactionType: getTransactionTypeLabel(transaction.transactionType),
    transactionDate: transaction.createdAt,
    branchName: additionalData?.branchName,
    cashierName: additionalData?.cashierName,
    items,
    subtotal,
    commission: additionalData?.commission,
    totalAmount: transaction.totalAmount,
    paymentMethod: transaction.paymentMethod,
    cashReceived: additionalData?.cashReceived,
    changeGiven: additionalData?.changeGiven,
  };

  // Add customer info if available
  if (
    additionalData?.customerName ||
    additionalData?.accountNumber ||
    additionalData?.cardNumber
  ) {
    receipt.customerInfo = {
      name: additionalData.customerName,
      accountNumber: additionalData.accountNumber
        ? maskAccountNumber(additionalData.accountNumber)
        : undefined,
      cardNumber: additionalData.cardNumber
        ? maskCardNumber(additionalData.cardNumber)
        : undefined,
    };
  }

  return receipt;
}

/**
 * Format receipt as text for printing
 */
export function formatReceiptText(receipt: ReceiptData): string {
  const lines: string[] = [];
  const lineWidth = 48;

  // Header
  lines.push(centerText("CAJA COOPERATIVA", lineWidth));
  lines.push(centerText("RECIBO DE TRANSACCIÓN", lineWidth));
  lines.push(repeatChar("=", lineWidth));

  // Transaction details
  lines.push(`No. Transacción: ${receipt.transactionNumber}`);
  lines.push(`Tipo: ${receipt.transactionType}`);
  lines.push(`Fecha: ${formatDateTime(receipt.transactionDate)}`);

  if (receipt.branchName) {
    lines.push(`Sucursal: ${receipt.branchName}`);
  }

  if (receipt.cashierName) {
    lines.push(`Cajero: ${receipt.cashierName}`);
  }

  lines.push(repeatChar("-", lineWidth));

  // Customer info
  if (receipt.customerInfo) {
    if (receipt.customerInfo.name) {
      lines.push(`Cliente: ${receipt.customerInfo.name}`);
    }
    if (receipt.customerInfo.accountNumber) {
      lines.push(`Cuenta: ${receipt.customerInfo.accountNumber}`);
    }
    if (receipt.customerInfo.cardNumber) {
      lines.push(`Tarjeta: ${receipt.customerInfo.cardNumber}`);
    }
    lines.push(repeatChar("-", lineWidth));
  }

  // Items
  lines.push(centerText("DETALLE", lineWidth));
  lines.push(repeatChar("-", lineWidth));

  receipt.items.forEach((item) => {
    lines.push(item.description);
    lines.push(
      formatAmountLine(
        `${item.quantity} x ${formatCurrency(item.unitPrice)}`,
        formatCurrency(item.total),
        lineWidth
      )
    );
  });

  lines.push(repeatChar("-", lineWidth));

  // Totals
  lines.push(formatAmountLine("Subtotal:", formatCurrency(receipt.subtotal), lineWidth));

  if (receipt.commission) {
    lines.push(
      formatAmountLine("Comisión:", formatCurrency(receipt.commission), lineWidth)
    );
  }

  lines.push(repeatChar("=", lineWidth));
  lines.push(
    formatAmountLine("TOTAL:", formatCurrency(receipt.totalAmount), lineWidth, true)
  );
  lines.push(repeatChar("=", lineWidth));

  // Payment info
  lines.push(`Método de pago: ${receipt.paymentMethod}`);

  if (receipt.cashReceived !== undefined) {
    lines.push(
      formatAmountLine("Efectivo recibido:", formatCurrency(receipt.cashReceived), lineWidth)
    );
  }

  if (receipt.changeGiven !== undefined) {
    lines.push(
      formatAmountLine("Cambio:", formatCurrency(receipt.changeGiven), lineWidth)
    );
  }

  // Footer
  lines.push(repeatChar("=", lineWidth));
  lines.push(centerText("GRACIAS POR SU PREFERENCIA", lineWidth));
  lines.push(centerText("Conserve este recibo", lineWidth));
  lines.push("");

  return lines.join("\n");
}

/**
 * Format receipt as HTML for display/printing
 */
export function formatReceiptHtml(receipt: ReceiptData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo - ${receipt.transactionNumber}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          max-width: 400px;
          margin: 20px auto;
          padding: 20px;
          background: white;
        }
        .receipt {
          border: 1px solid #ccc;
          padding: 20px;
        }
        .header {
          text-align: center;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .section {
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 1px dashed #ccc;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .label {
          font-weight: bold;
        }
        .total-row {
          font-weight: bold;
          font-size: 1.2em;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #000;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.9em;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .receipt {
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div>CAJA COOPERATIVA</div>
          <div>RECIBO DE TRANSACCIÓN</div>
        </div>
        
        <div class="section">
          <div class="row">
            <span class="label">No. Transacción:</span>
            <span>${receipt.transactionNumber}</span>
          </div>
          <div class="row">
            <span class="label">Tipo:</span>
            <span>${receipt.transactionType}</span>
          </div>
          <div class="row">
            <span class="label">Fecha:</span>
            <span>${formatDateTime(receipt.transactionDate)}</span>
          </div>
          ${receipt.branchName ? `<div class="row"><span class="label">Sucursal:</span><span>${receipt.branchName}</span></div>` : ""}
          ${receipt.cashierName ? `<div class="row"><span class="label">Cajero:</span><span>${receipt.cashierName}</span></div>` : ""}
        </div>
        
        ${
          receipt.customerInfo
            ? `
        <div class="section">
          ${receipt.customerInfo.name ? `<div class="row"><span class="label">Cliente:</span><span>${receipt.customerInfo.name}</span></div>` : ""}
          ${receipt.customerInfo.accountNumber ? `<div class="row"><span class="label">Cuenta:</span><span>${receipt.customerInfo.accountNumber}</span></div>` : ""}
          ${receipt.customerInfo.cardNumber ? `<div class="row"><span class="label">Tarjeta:</span><span>${receipt.customerInfo.cardNumber}</span></div>` : ""}
        </div>
        `
            : ""
        }
        
        <div class="section">
          <div class="label" style="text-align: center; margin-bottom: 10px;">DETALLE</div>
          ${receipt.items
            .map(
              (item) => `
            <div style="margin: 10px 0;">
              <div>${item.description}</div>
              <div class="row">
                <span>${item.quantity} x ${formatCurrency(item.unitPrice)}</span>
                <span>${formatCurrency(item.total)}</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="section">
          <div class="row">
            <span class="label">Subtotal:</span>
            <span>${formatCurrency(receipt.subtotal)}</span>
          </div>
          ${receipt.commission ? `<div class="row"><span class="label">Comisión:</span><span>${formatCurrency(receipt.commission)}</span></div>` : ""}
          <div class="row total-row">
            <span>TOTAL:</span>
            <span>${formatCurrency(receipt.totalAmount)}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="row">
            <span class="label">Método de pago:</span>
            <span>${receipt.paymentMethod}</span>
          </div>
          ${receipt.cashReceived !== undefined ? `<div class="row"><span class="label">Efectivo recibido:</span><span>${formatCurrency(receipt.cashReceived)}</span></div>` : ""}
          ${receipt.changeGiven !== undefined ? `<div class="row"><span class="label">Cambio:</span><span>${formatCurrency(receipt.changeGiven)}</span></div>` : ""}
        </div>
        
        <div class="footer">
          <div>GRACIAS POR SU PREFERENCIA</div>
          <div>Conserve este recibo</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Mask account number (show only last 4 digits)
 */
function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }
  const visibleDigits = accountNumber.slice(-4);
  const maskedLength = accountNumber.length - 4;
  return "*".repeat(maskedLength) + visibleDigits;
}

/**
 * Mask card number (show only last 4 digits)
 */
function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length <= 4) {
    return cardNumber;
  }
  const visibleDigits = cardNumber.slice(-4);
  return `**** **** **** ${visibleDigits}`;
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format date and time
 */
function formatDateTime(date: Date): string {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeStr = d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${dateStr} ${timeStr}`;
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
function repeatChar(char: string, times: number): string {
  return char.repeat(times);
}

/**
 * Format line with amount (left aligned label, right aligned amount)
 */
function formatAmountLine(
  label: string,
  amount: string,
  width: number,
  bold: boolean = false
): string {
  const spaces = Math.max(1, width - label.length - amount.length);
  const line = label + " ".repeat(spaces) + amount;
  return bold ? line.toUpperCase() : line;
}

/**
 * Get human-readable transaction type label
 */
function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ServicePayment: "Pago de Servicio",
    CardPayment: "Pago de Tarjeta",
    DiestelPayment: "Pago Diestel",
    CashDeposit: "Depósito en Efectivo",
    CashWithdrawal: "Retiro en Efectivo",
  };
  return labels[type] || type;
}
