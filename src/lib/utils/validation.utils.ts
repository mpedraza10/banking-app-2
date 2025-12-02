"use server";

import { z } from "zod";

// ==================== CUSTOMER VALIDATION ====================

export const customerSearchSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  taxId: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
}).refine(
  (data) => {
    // At least two criteria must be provided
    const criteria = [
      data.firstName,
      data.lastName,
      data.taxId,
      data.phoneNumber,
      data.email,
    ].filter(Boolean);
    return criteria.length >= 2;
  },
  {
    message: "Se requieren al menos dos criterios de búsqueda",
  }
);

export const customerUpdateSchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido"),
  lastName: z.string().min(1, "Apellido es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phoneNumber: z.string().regex(/^\d{10}$/, "Teléfono debe tener 10 dígitos").optional().or(z.literal("")),
  alternatePhone: z.string().regex(/^\d{10}$/, "Teléfono alternativo debe tener 10 dígitos").optional().or(z.literal("")),
  street: z.string().optional(),
  exteriorNumber: z.string().optional(),
  interiorNumber: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, "Código postal debe tener 5 dígitos").optional().or(z.literal("")),
});

// ==================== SERVICE PAYMENT VALIDATION ====================

export const servicePaymentSchema = z.object({
  serviceId: z.string().uuid("ID de servicio inválido"),
  referenceNumber: z.string().min(1, "Número de referencia es requerido"),
  paymentAmount: z.number().positive("Monto debe ser positivo"),
  customerId: z.string().uuid().optional(),
}).refine(
  (data) => {
    // Validate payment amount is not zero
    return data.paymentAmount > 0;
  },
  {
    message: "El monto del pago debe ser mayor a cero",
    path: ["paymentAmount"],
  }
);

/**
 * Validate service reference format based on service provider
 */
export function validateServiceReference(
  serviceCode: string,
  referenceNumber: string
): { isValid: boolean; error?: string } {
  const referenceFormats: Record<string, RegExp> = {
    CFE: /^\d{10,12}$/, // 10-12 digit numeric
    TELMEX: /^\d{10}$/, // 10 digit phone number
    CABLEVISION: /^[A-Z0-9]{8,12}$/, // 8-12 alphanumeric
    GNM: /^\d{8,10}$/, // 8-10 digit numeric
    DIESTEL: /^[A-Z0-9]{10,15}$/, // 10-15 alphanumeric
  };

  const format = referenceFormats[serviceCode.toUpperCase()];
  if (!format) {
    return { isValid: false, error: "Formato de servicio no encontrado" };
  }

  if (!format.test(referenceNumber)) {
    return {
      isValid: false,
      error: `Formato de referencia inválido para ${serviceCode}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate payment due date
 */
export function validatePaymentDueDate(dueDate: Date): {
  isValid: boolean;
  isExpired: boolean;
  error?: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);

  if (dueDateObj < today) {
    return {
      isValid: false,
      isExpired: true,
      error: "Recibo vencido - No se puede procesar este pago",
    };
  }

  return { isValid: true, isExpired: false };
}

// ==================== CARD PAYMENT VALIDATION ====================

export const cardPaymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Número de tarjeta debe tener 16 dígitos"),
  paymentAmount: z.number().positive("Monto debe ser positivo"),
  paymentType: z.enum(["minimum", "total", "custom"], {
    message: "Tipo de pago inválido",
  }),
  cashReceived: z.number().nonnegative("Efectivo recibido debe ser mayor o igual a cero"),
}).refine(
  (data) => {
    // Cash received must be >= payment amount
    return data.cashReceived >= data.paymentAmount;
  },
  {
    message: "El efectivo recibido debe ser mayor o igual al monto del pago",
    path: ["cashReceived"],
  }
);

/**
 * Validate card number format
 */
export function validateCardNumber(cardNumber: string): {
  isValid: boolean;
  error?: string;
} {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  if (!/^\d{16}$/.test(cleaned)) {
    return {
      isValid: false,
      error: "Número de tarjeta debe tener 16 dígitos",
    };
  }

  // Luhn algorithm check
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const isValidLuhn = sum % 10 === 0;
  if (!isValidLuhn) {
    return {
      isValid: false,
      error: "Número de tarjeta inválido",
    };
  }

  return { isValid: true };
}

/**
 * Validate payment amount against account balance
 */
export function validatePaymentAmount(
  paymentAmount: number,
  accountBalance: number,
  minimumPayment: number
): { isValid: boolean; warning?: string; error?: string } {
  if (paymentAmount <= 0) {
    return {
      isValid: false,
      error: "El monto del pago debe ser mayor a cero",
    };
  }

  if (paymentAmount > accountBalance) {
    return {
      isValid: false,
      error: "El monto del pago excede el saldo disponible",
    };
  }

  if (paymentAmount < minimumPayment) {
    return {
      isValid: true,
      warning: `El monto es menor al pago mínimo de $${minimumPayment.toFixed(2)}`,
    };
  }

  return { isValid: true };
}

// ==================== CASH DENOMINATION VALIDATION ====================

export const cashDenominationSchema = z.object({
  denomination: z.number().positive("Denominación debe ser positiva"),
  quantity: z.number().int().nonnegative("Cantidad debe ser un número entero no negativo"),
  amount: z.number().nonnegative("Monto debe ser no negativo"),
});

export const denominationEntrySchema = z.object({
  denominations: z.array(cashDenominationSchema),
  expectedTotal: z.number().positive("Total esperado debe ser positivo").optional(),
}).refine(
  (data) => {
    const total = data.denominations.reduce((sum, d) => sum + d.amount, 0);
    // If expectedTotal is provided, validate that totals match
    if (data.expectedTotal !== undefined) {
      return Math.abs(total - data.expectedTotal) < 0.01; // Allow for floating point precision
    }
    return true;
  },
  {
    message: "Total entrada de denominaciones no coincide con el total esperado",
  }
);

/**
 * Validate denomination total matches expected amount
 */
export function validateDenominationTotal(
  denominations: Array<{ denomination: number; quantity: number }>,
  expectedTotal: number
): { isValid: boolean; actualTotal: number; error?: string } {
  const actualTotal = denominations.reduce(
    (sum, d) => sum + d.denomination * d.quantity,
    0
  );

  if (Math.abs(actualTotal - expectedTotal) >= 0.01) {
    return {
      isValid: false,
      actualTotal,
      error: `Total entrada de denominaciones (${actualTotal.toFixed(
        2
      )}) no coincide con el total esperado (${expectedTotal.toFixed(2)})`,
    };
  }

  return { isValid: true, actualTotal };
}

/**
 * Validate sufficient cash inventory for change
 */
export function validateChangeInventory(
  changeAmount: number,
  inventory: Array<{ denomination: number; quantity: number }>
): {
  isValid: boolean;
  breakdown?: Array<{ denomination: number; quantity: number }>;
  insufficientDenominations?: number[];
  error?: string;
} {
  // Sort denominations from largest to smallest
  const sortedInventory = [...inventory].sort(
    (a, b) => b.denomination - a.denomination
  );

  const changeBreakdown: Array<{ denomination: number; quantity: number }> = [];
  let remaining = changeAmount;

  // Greedy algorithm to calculate change
  for (const item of sortedInventory) {
    if (remaining <= 0) break;

    const maxQuantity = Math.floor(remaining / item.denomination);
    const neededQuantity = Math.min(maxQuantity, item.quantity);

    if (neededQuantity > 0) {
      changeBreakdown.push({
        denomination: item.denomination,
        quantity: neededQuantity,
      });
      remaining -= neededQuantity * item.denomination;
    }
  }

  // Check if we can make exact change
  if (remaining > 0.01) {
    // Allow for floating point precision
    const insufficientDenominations = sortedInventory
      .filter((item) => {
        const needed = Math.floor(remaining / item.denomination);
        return needed > 0 && item.quantity < needed;
      })
      .map((item) => item.denomination);

    return {
      isValid: false,
      insufficientDenominations,
      error: "Inventario insuficiente para dispensar el cambio exacto",
    };
  }

  return {
    isValid: true,
    breakdown: changeBreakdown,
  };
}

// ==================== DIESTEL PAYMENT VALIDATION ====================

export const diestelPaymentSchema = z.object({
  referenceNumber: z.string().min(1, "Número de referencia es requerido"),
  paymentAmount: z.number().positive("Monto debe ser positivo"),
  customerId: z.string().uuid().optional(),
}).refine(
  (data) => {
    // Diestel has a fixed credit limit of $100,000
    return data.paymentAmount <= 100000;
  },
  {
    message: "El monto excede el límite de crédito de Diestel ($100,000)",
    path: ["paymentAmount"],
  }
);

/**
 * Validate Diestel daily limit
 */
export function validateDiestelDailyLimit(
  currentDayTotal: number,
  newPaymentAmount: number
): { isValid: boolean; error?: string; remainingLimit?: number } {
  const DAILY_LIMIT_MAX = 8000;

  const projectedTotal = currentDayTotal + newPaymentAmount;

  if (projectedTotal > DAILY_LIMIT_MAX) {
    return {
      isValid: false,
      error: `Este pago excedería el límite diario de Diestel ($${DAILY_LIMIT_MAX.toFixed(
        2
      )}). Total actual: $${currentDayTotal.toFixed(2)}`,
      remainingLimit: DAILY_LIMIT_MAX - currentDayTotal,
    };
  }

  return {
    isValid: true,
    remainingLimit: DAILY_LIMIT_MAX - projectedTotal,
  };
}

// ==================== TRANSACTION VALIDATION ====================

export const transactionSchema = z.object({
  transactionType: z.enum(
    ["ServicePayment", "CardPayment", "DiestelPayment", "CashDeposit", "CashWithdrawal"],
    {
      message: "Tipo de transacción inválido",
    }
  ),
  totalAmount: z.number().positive("Monto total debe ser positivo"),
  paymentMethod: z.string().min(1, "Método de pago es requerido"),
  customerId: z.string().uuid().optional(),
  notes: z.string().max(500, "Notas no pueden exceder 500 caracteres").optional(),
});

/**
 * Generic validation error type
 */
export type ValidationError = {
  field: string;
  message: string;
};

/**
 * Generic validation result type
 */
export type ValidationResult<T = unknown> = {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
};

/**
 * Validate data against a Zod schema
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      isValid: true,
      data: result.data,
    };
  }

  const errors: ValidationError[] = result.error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return {
    isValid: false,
    errors,
  };
}
