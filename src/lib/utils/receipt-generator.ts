import type { TransactionDetail } from "@/lib/actions/transactions";

// Receipt data interface
export interface ReceiptData {
  transactionNumber: string;
  transactionType: string;
  transactionDate: Date;
  transactionAmount: number;
  paymentMethod: string;
  customerInfo?: {
    name?: string;
    accountNumber?: string; // Masked
    cardNumber?: string; // Masked
  };
  items: ReceiptItem[];
  cashDetails?: {
    amountReceived: number;
    change: number;
  };
  serviceDetails?: {
    serviceName: string;
    referenceNumber: string;
    dueDate?: Date;
  };
  branchInfo: {
    branchName: string;
    branchId: string;
  };
  cashierInfo: {
    cashierId: string;
    cashierName: string;
  };
  confirmationNumber?: string;
}

// Receipt item interface
export interface ReceiptItem {
  description: string;
  quantity: number;
  amount: number;
}

/**
 * Mask account numbers - show only last 4 digits
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) {
    return "****";
  }
  const lastFour = accountNumber.slice(-4);
  const maskedPart = "*".repeat(Math.max(0, accountNumber.length - 4));
  return `${maskedPart}${lastFour}`;
}

/**
 * Mask card numbers - show only last 4 digits
 */
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 4) {
    return "****";
  }
  const lastFour = cardNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
}

/**
 * Format currency for receipt display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

/**
 * Format date for receipt display
 */
export function formatReceiptDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/**
 * Generate receipt HTML from transaction data
 */
export function generateReceiptHTML(receiptData: ReceiptData): string {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo - ${receiptData.transactionNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
    }
    
    .receipt {
      border: 1px solid #000;
      padding: 15px;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    
    .header h1 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .header p {
      font-size: 11px;
    }
    
    .section {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #000;
    }
    
    .section:last-child {
      border-bottom: none;
    }
    
    .section-title {
      font-weight: bold;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    
    .label {
      font-weight: bold;
    }
    
    .value {
      text-align: right;
    }
    
    .items {
      margin-top: 10px;
    }
    
    .item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      padding-left: 10px;
    }
    
    .total-section {
      border-top: 2px solid #000;
      padding-top: 10px;
      margin-top: 10px;
    }
    
    .total {
      font-size: 14px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #000;
      font-size: 10px;
    }
    
    .confirmation {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      margin: 15px 0;
      padding: 10px;
      border: 2px solid #000;
    }
    
    @media print {
      body {
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
      <h1>CAJA CORPORATIVA</h1>
      <p>RECIBO DE TRANSACCIÓN</p>
      <p>${receiptData.branchInfo.branchName}</p>
    </div>
    
    <div class="section">
      <div class="row">
        <span class="label">No. Transacción:</span>
        <span class="value">${receiptData.transactionNumber}</span>
      </div>
      <div class="row">
        <span class="label">Fecha:</span>
        <span class="value">${formatReceiptDate(receiptData.transactionDate)}</span>
      </div>
      <div class="row">
        <span class="label">Tipo:</span>
        <span class="value">${getTransactionTypeLabel(receiptData.transactionType)}</span>
      </div>
      <div class="row">
        <span class="label">Cajero:</span>
        <span class="value">${receiptData.cashierInfo.cashierName} (${receiptData.cashierInfo.cashierId})</span>
      </div>
    </div>
    
    ${receiptData.customerInfo ? `
    <div class="section">
      <div class="section-title">Información del Cliente</div>
      ${receiptData.customerInfo.name ? `
      <div class="row">
        <span class="label">Cliente:</span>
        <span class="value">${receiptData.customerInfo.name}</span>
      </div>
      ` : ''}
      ${receiptData.customerInfo.accountNumber ? `
      <div class="row">
        <span class="label">Cuenta:</span>
        <span class="value">${maskAccountNumber(receiptData.customerInfo.accountNumber)}</span>
      </div>
      ` : ''}
      ${receiptData.customerInfo.cardNumber ? `
      <div class="row">
        <span class="label">Tarjeta:</span>
        <span class="value">${maskCardNumber(receiptData.customerInfo.cardNumber)}</span>
      </div>
      ` : ''}
    </div>
    ` : ''}
    
    ${receiptData.serviceDetails ? `
    <div class="section">
      <div class="section-title">Detalles del Servicio</div>
      <div class="row">
        <span class="label">Servicio:</span>
        <span class="value">${receiptData.serviceDetails.serviceName}</span>
      </div>
      <div class="row">
        <span class="label">Referencia:</span>
        <span class="value">${receiptData.serviceDetails.referenceNumber}</span>
      </div>
      ${receiptData.serviceDetails.dueDate ? `
      <div class="row">
        <span class="label">Vencimiento:</span>
        <span class="value">${formatReceiptDate(receiptData.serviceDetails.dueDate)}</span>
      </div>
      ` : ''}
    </div>
    ` : ''}
    
    <div class="section">
      <div class="section-title">Conceptos</div>
      <div class="items">
        ${receiptData.items.map(item => `
        <div class="item">
          <span>${item.description} (${item.quantity})</span>
          <span>${formatCurrency(item.amount)}</span>
        </div>
        `).join('')}
      </div>
    </div>
    
    <div class="section total-section">
      <div class="total">
        <span>TOTAL:</span>
        <span>${formatCurrency(receiptData.transactionAmount)}</span>
      </div>
      <div class="row">
        <span class="label">Método de Pago:</span>
        <span class="value">${receiptData.paymentMethod}</span>
      </div>
      ${receiptData.cashDetails ? `
      <div class="row">
        <span class="label">Efectivo Recibido:</span>
        <span class="value">${formatCurrency(receiptData.cashDetails.amountReceived)}</span>
      </div>
      <div class="row">
        <span class="label">Cambio:</span>
        <span class="value">${formatCurrency(receiptData.cashDetails.change)}</span>
      </div>
      ` : ''}
    </div>
    
    ${receiptData.confirmationNumber ? `
    <div class="confirmation">
      CONFIRMACIÓN: ${receiptData.confirmationNumber}
    </div>
    ` : ''}
    
    <div class="footer">
      <p>Gracias por su preferencia</p>
      <p>Conserve este recibo como comprobante</p>
      <p>© 2024 Caja Corporativa - Todos los derechos reservados</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Generate receipt text format (for thermal printers)
 */
export function generateReceiptText(receiptData: ReceiptData): string {
  const lines: string[] = [];
  const width = 40; // Character width for thermal printer

  // Helper function to center text
  const centerText = (text: string): string => {
    const padding = Math.floor((width - text.length) / 2);
    return " ".repeat(Math.max(0, padding)) + text;
  };

  // Helper function to format line with label and value
  const formatLine = (label: string, value: string): string => {
    const dots = ".".repeat(Math.max(0, width - label.length - value.length));
    return `${label}${dots}${value}`;
  };

  // Header
  lines.push("========================================");
  lines.push(centerText("CAJA CORPORATIVA"));
  lines.push(centerText("RECIBO DE TRANSACCIÓN"));
  lines.push(centerText(receiptData.branchInfo.branchName));
  lines.push("========================================");
  lines.push("");

  // Transaction info
  lines.push(formatLine("No. Transacción", receiptData.transactionNumber));
  lines.push(formatLine("Fecha", formatReceiptDate(receiptData.transactionDate)));
  lines.push(formatLine("Tipo", getTransactionTypeLabel(receiptData.transactionType)));
  lines.push(formatLine("Cajero", `${receiptData.cashierInfo.cashierName}`));
  lines.push("----------------------------------------");

  // Customer info
  if (receiptData.customerInfo) {
    if (receiptData.customerInfo.name) {
      lines.push(formatLine("Cliente", receiptData.customerInfo.name));
    }
    if (receiptData.customerInfo.accountNumber) {
      lines.push(formatLine("Cuenta", maskAccountNumber(receiptData.customerInfo.accountNumber)));
    }
    if (receiptData.customerInfo.cardNumber) {
      lines.push(formatLine("Tarjeta", maskCardNumber(receiptData.customerInfo.cardNumber)));
    }
    lines.push("----------------------------------------");
  }

  // Service details
  if (receiptData.serviceDetails) {
    lines.push(formatLine("Servicio", receiptData.serviceDetails.serviceName));
    lines.push(formatLine("Referencia", receiptData.serviceDetails.referenceNumber));
    lines.push("----------------------------------------");
  }

  // Items
  lines.push(centerText("CONCEPTOS"));
  receiptData.items.forEach((item) => {
    lines.push(`${item.description} (${item.quantity})`);
    lines.push(formatLine("  Importe", formatCurrency(item.amount)));
  });
  lines.push("========================================");

  // Totals
  lines.push(formatLine("TOTAL", formatCurrency(receiptData.transactionAmount)));
  lines.push(formatLine("Método de Pago", receiptData.paymentMethod));
  
  if (receiptData.cashDetails) {
    lines.push(formatLine("Efectivo Recibido", formatCurrency(receiptData.cashDetails.amountReceived)));
    lines.push(formatLine("Cambio", formatCurrency(receiptData.cashDetails.change)));
  }
  lines.push("========================================");

  // Confirmation
  if (receiptData.confirmationNumber) {
    lines.push("");
    lines.push(centerText("CONFIRMACIÓN"));
    lines.push(centerText(receiptData.confirmationNumber));
    lines.push("");
  }

  // Footer
  lines.push("");
  lines.push(centerText("Gracias por su preferencia"));
  lines.push(centerText("Conserve este recibo"));
  lines.push("");
  lines.push("========================================");

  return lines.join("\n");
}

/**
 * Get transaction type label in Spanish
 */
function getTransactionTypeLabel(transactionType: string): string {
  const labels: Record<string, string> = {
    ServicePayment: "Pago de Servicio",
    CardPayment: "Pago de Tarjeta",
    DiestelPayment: "Pago Diestel",
    CashDeposit: "Depósito en Efectivo",
    CashWithdrawal: "Retiro en Efectivo",
  };
  return labels[transactionType] || transactionType;
}

/**
 * Convert transaction detail to receipt data
 */
export function transactionToReceiptData(
  transaction: TransactionDetail,
  additionalData?: {
    customerName?: string;
    accountNumber?: string;
    cardNumber?: string;
    cashReceived?: number;
    change?: number;
    serviceName?: string;
    referenceNumber?: string;
    dueDate?: Date;
    branchName?: string;
    cashierName?: string;
    confirmationNumber?: string;
  }
): ReceiptData {
  return {
    transactionNumber: transaction.transactionNumber,
    transactionType: transaction.transactionType,
    transactionDate: transaction.createdAt,
    transactionAmount: transaction.totalAmount,
    paymentMethod: transaction.paymentMethod,
    customerInfo: additionalData?.customerName || additionalData?.accountNumber || additionalData?.cardNumber
      ? {
          name: additionalData?.customerName,
          accountNumber: additionalData?.accountNumber,
          cardNumber: additionalData?.cardNumber,
        }
      : undefined,
    items: transaction.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amount: item.amount,
    })),
    cashDetails:
      additionalData?.cashReceived && additionalData?.change !== undefined
        ? {
            amountReceived: additionalData.cashReceived,
            change: additionalData.change,
          }
        : undefined,
    serviceDetails:
      additionalData?.serviceName || additionalData?.referenceNumber
        ? {
            serviceName: additionalData.serviceName || "",
            referenceNumber: additionalData.referenceNumber || "",
            dueDate: additionalData.dueDate,
          }
        : undefined,
    branchInfo: {
      branchName: additionalData?.branchName || "Sucursal Principal",
      branchId: transaction.branchId,
    },
    cashierInfo: {
      cashierId: transaction.userId,
      cashierName: additionalData?.cashierName || "Cajero",
    },
    confirmationNumber: additionalData?.confirmationNumber,
  };
}
