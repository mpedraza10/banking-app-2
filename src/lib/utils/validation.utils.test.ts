import { describe, it, expect } from "vitest";
import {
  validateServiceReference,
  validatePaymentDueDate,
  validateCardNumber,
  validatePaymentAmount,
  validateDenominationTotal,
  validateChangeInventory,
  validateDiestelDailyLimit,
  validateWithSchema,
  customerSearchSchema,
  servicePaymentSchema,
  cardPaymentSchema,
  denominationEntrySchema,
  diestelPaymentSchema,
  transactionSchema,
} from "./validation.utils";

describe("Service Reference Validation", () => {
  it("should validate CFE reference format", () => {
    const valid = validateServiceReference("CFE", "1234567890");
    expect(valid.isValid).toBe(true);

    const invalid = validateServiceReference("CFE", "12345");
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toContain("Formato de referencia inválido");
  });

  it("should validate TELMEX reference format", () => {
    const valid = validateServiceReference("TELMEX", "5551234567");
    expect(valid.isValid).toBe(true);

    const invalid = validateServiceReference("TELMEX", "555123456");
    expect(invalid.isValid).toBe(false);
  });

  it("should validate CABLEVISION reference format", () => {
    const valid = validateServiceReference("CABLEVISION", "ABC12345");
    expect(valid.isValid).toBe(true);

    const invalid = validateServiceReference("CABLEVISION", "abc");
    expect(invalid.isValid).toBe(false);
  });

  it("should return error for unknown service code", () => {
    const result = validateServiceReference("UNKNOWN", "12345");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Formato de servicio no encontrado");
  });
});

describe("Payment Due Date Validation", () => {
  it("should validate future due date", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const result = validatePaymentDueDate(futureDate);
    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(false);
  });

  it("should invalidate expired due date", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);

    const result = validatePaymentDueDate(pastDate);
    expect(result.isValid).toBe(false);
    expect(result.isExpired).toBe(true);
    expect(result.error).toContain("Recibo vencido");
  });

  it("should validate today's due date as valid", () => {
    const today = new Date();
    const result = validatePaymentDueDate(today);
    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(false);
  });
});

describe("Card Number Validation", () => {
  it("should validate correct 16-digit card number", () => {
    // Valid test card number (passes Luhn check)
    const result = validateCardNumber("4532015112830366");
    expect(result.isValid).toBe(true);
  });

  it("should invalidate card number with wrong length", () => {
    const result = validateCardNumber("4532015112");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("16 dígitos");
  });

  it("should invalidate card number with non-numeric characters", () => {
    const result = validateCardNumber("453201511283036A");
    expect(result.isValid).toBe(false);
  });

  it("should invalidate card number failing Luhn check", () => {
    const result = validateCardNumber("4532015112830367");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("inválido");
  });

  it("should validate card number with spaces", () => {
    const result = validateCardNumber("4532 0151 1283 0366");
    expect(result.isValid).toBe(true);
  });
});

describe("Payment Amount Validation", () => {
  it("should validate payment within balance", () => {
    const result = validatePaymentAmount(500, 1000, 100);
    expect(result.isValid).toBe(true);
    expect(result.warning).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  it("should invalidate payment exceeding balance", () => {
    const result = validatePaymentAmount(1500, 1000, 100);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("excede el saldo disponible");
  });

  it("should warn when payment is below minimum", () => {
    const result = validatePaymentAmount(50, 1000, 100);
    expect(result.isValid).toBe(true);
    expect(result.warning).toContain("menor al pago mínimo");
  });

  it("should invalidate zero or negative payment", () => {
    const result = validatePaymentAmount(0, 1000, 100);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("mayor a cero");
  });
});

describe("Denomination Total Validation", () => {
  it("should validate matching denomination total", () => {
    const denominations = [
      { denomination: 500, quantity: 2 },
      { denomination: 100, quantity: 5 },
      { denomination: 50, quantity: 3 },
    ];
    const expectedTotal = 1650; // (500*2) + (100*5) + (50*3)

    const result = validateDenominationTotal(denominations, expectedTotal);
    expect(result.isValid).toBe(true);
    expect(result.actualTotal).toBe(1650);
  });

  it("should invalidate mismatched denomination total", () => {
    const denominations = [
      { denomination: 500, quantity: 2 },
      { denomination: 100, quantity: 5 },
    ];
    const expectedTotal = 2000;

    const result = validateDenominationTotal(denominations, expectedTotal);
    expect(result.isValid).toBe(false);
    expect(result.actualTotal).toBe(1500);
    expect(result.error).toContain("no coincide");
  });

  it("should handle empty denominations", () => {
    const result = validateDenominationTotal([], 0);
    expect(result.isValid).toBe(true);
    expect(result.actualTotal).toBe(0);
  });
});

describe("Change Inventory Validation", () => {
  it("should calculate valid change breakdown", () => {
    const inventory = [
      { denomination: 500, quantity: 10 },
      { denomination: 100, quantity: 20 },
      { denomination: 50, quantity: 30 },
      { denomination: 20, quantity: 40 },
      { denomination: 10, quantity: 50 },
    ];

    const result = validateChangeInventory(780, inventory);
    expect(result.isValid).toBe(true);
    expect(result.breakdown).toBeDefined();

    // Should use: 1x500, 2x100, 1x50, 1x20, 1x10 = 780
    const totalChange = result.breakdown!.reduce(
      (sum, item) => sum + item.denomination * item.quantity,
      0
    );
    expect(totalChange).toBe(780);
  });

  it("should detect insufficient inventory", () => {
    const inventory = [
      { denomination: 500, quantity: 0 },
      { denomination: 100, quantity: 2 },
    ];

    const result = validateChangeInventory(500, inventory);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Inventario insuficiente");
    expect(result.insufficientDenominations).toBeDefined();
  });

  it("should handle exact change with available denominations", () => {
    const inventory = [
      { denomination: 100, quantity: 5 },
      { denomination: 50, quantity: 2 },
    ];

    const result = validateChangeInventory(200, inventory);
    expect(result.isValid).toBe(true);
    expect(result.breakdown).toBeDefined();
  });
});

describe("Diestel Daily Limit Validation", () => {
  it("should validate payment within daily limit", () => {
    const result = validateDiestelDailyLimit(5000, 2000);
    expect(result.isValid).toBe(true);
    expect(result.remainingLimit).toBe(1000); // 8000 - 7000
  });

  it("should invalidate payment exceeding daily limit", () => {
    const result = validateDiestelDailyLimit(7500, 1000);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("excedería el límite diario");
    expect(result.remainingLimit).toBe(500);
  });

  it("should validate payment at daily limit boundary", () => {
    const result = validateDiestelDailyLimit(7000, 1000);
    expect(result.isValid).toBe(true);
    expect(result.remainingLimit).toBe(0);
  });
});

describe("Customer Search Schema Validation", () => {
  it("should validate search with two criteria", () => {
    const data = {
      firstName: "Juan",
      lastName: "Pérez",
    };

    const result = validateWithSchema(customerSearchSchema, data);
    expect(result.isValid).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should invalidate search with one criterion", () => {
    const data = {
      firstName: "Juan",
    };

    const result = validateWithSchema(customerSearchSchema, data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain("al menos dos criterios");
  });

  it("should validate email format", () => {
    const data = {
      firstName: "Juan",
      email: "invalid-email",
    };

    const result = validateWithSchema(customerSearchSchema, data);
    expect(result.isValid).toBe(false);
  });
});

describe("Service Payment Schema Validation", () => {
  it("should validate correct service payment data", () => {
    const data = {
      serviceId: "123e4567-e89b-12d3-a456-426614174000",
      referenceNumber: "1234567890",
      paymentAmount: 500,
    };

    const result = validateWithSchema(servicePaymentSchema, data);
    expect(result.isValid).toBe(true);
  });

  it("should invalidate negative payment amount", () => {
    const data = {
      serviceId: "123e4567-e89b-12d3-a456-426614174000",
      referenceNumber: "1234567890",
      paymentAmount: -100,
    };

    const result = validateWithSchema(servicePaymentSchema, data);
    expect(result.isValid).toBe(false);
  });

  it("should invalidate zero payment amount", () => {
    const data = {
      serviceId: "123e4567-e89b-12d3-a456-426614174000",
      referenceNumber: "1234567890",
      paymentAmount: 0,
    };

    const result = validateWithSchema(servicePaymentSchema, data);
    expect(result.isValid).toBe(false);
  });
});

describe("Card Payment Schema Validation", () => {
  it("should validate correct card payment data", () => {
    const data = {
      cardNumber: "4532015112830366",
      paymentAmount: 500,
      paymentType: "total",
      cashReceived: 600,
    };

    const result = validateWithSchema(cardPaymentSchema, data);
    expect(result.isValid).toBe(true);
  });

  it("should invalidate insufficient cash received", () => {
    const data = {
      cardNumber: "4532015112830366",
      paymentAmount: 500,
      paymentType: "total",
      cashReceived: 400,
    };

    const result = validateWithSchema(cardPaymentSchema, data);
    expect(result.isValid).toBe(false);
    expect(result.errors![0].message).toContain("mayor o igual al monto");
  });

  it("should invalidate invalid card number format", () => {
    const data = {
      cardNumber: "12345",
      paymentAmount: 500,
      paymentType: "total",
      cashReceived: 500,
    };

    const result = validateWithSchema(cardPaymentSchema, data);
    expect(result.isValid).toBe(false);
  });
});

describe("Denomination Entry Schema Validation", () => {
  it("should validate matching denomination entry", () => {
    const data = {
      denominations: [
        { denomination: 500, quantity: 2, amount: 1000 },
        { denomination: 100, quantity: 5, amount: 500 },
      ],
      expectedTotal: 1500,
    };

    const result = validateWithSchema(denominationEntrySchema, data);
    expect(result.isValid).toBe(true);
  });

  it("should invalidate mismatched denomination entry", () => {
    const data = {
      denominations: [
        { denomination: 500, quantity: 2, amount: 1000 },
        { denomination: 100, quantity: 5, amount: 500 },
      ],
      expectedTotal: 2000,
    };

    const result = validateWithSchema(denominationEntrySchema, data);
    expect(result.isValid).toBe(false);
    expect(result.errors![0].message).toContain("no coincide");
  });
});

describe("Diestel Payment Schema Validation", () => {
  it("should validate payment within credit limit", () => {
    const data = {
      referenceNumber: "ABC12345678",
      paymentAmount: 50000,
    };

    const result = validateWithSchema(diestelPaymentSchema, data);
    expect(result.isValid).toBe(true);
  });

  it("should invalidate payment exceeding credit limit", () => {
    const data = {
      referenceNumber: "ABC12345678",
      paymentAmount: 150000,
    };

    const result = validateWithSchema(diestelPaymentSchema, data);
    expect(result.isValid).toBe(false);
    expect(result.errors![0].message).toContain("límite de crédito");
  });
});

describe("Transaction Schema Validation", () => {
  it("should validate correct transaction data", () => {
    const data = {
      transactionType: "ServicePayment",
      totalAmount: 500,
      paymentMethod: "Cash",
    };

    const result = validateWithSchema(transactionSchema, data);
    expect(result.isValid).toBe(true);
  });

  it("should invalidate invalid transaction type", () => {
    const data = {
      transactionType: "InvalidType",
      totalAmount: 500,
      paymentMethod: "Cash",
    };

    const result = validateWithSchema(transactionSchema, data);
    expect(result.isValid).toBe(false);
  });

  it("should invalidate notes exceeding length limit", () => {
    const data = {
      transactionType: "ServicePayment",
      totalAmount: 500,
      paymentMethod: "Cash",
      notes: "a".repeat(501),
    };

    const result = validateWithSchema(transactionSchema, data);
    expect(result.isValid).toBe(false);
    expect(result.errors![0].message).toContain("500 caracteres");
  });
});
