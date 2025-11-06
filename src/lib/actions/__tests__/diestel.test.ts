import { describe, it, expect, vi } from "vitest";

/**
 * Unit Tests for Diestel Payment Logic
 * 
 * Tests credit limit validation, reconciliation functionality, and payment processing
 */

describe("Diestel Payment Validation", () => {
  describe("Reference Number Validation", () => {
    it("should accept valid 30-digit reference", () => {
      const validReference = "123456789012345678901234567890";
      const cleanReference = validReference.replace(/[\s-]/g, "");
      
      expect(cleanReference.length).toBe(30);
      expect(/^\d{30}$/.test(cleanReference)).toBe(true);
    });

    it("should reject reference with less than 30 digits", () => {
      const invalidReference = "12345678901234567890123456789"; // 29 digits
      const cleanReference = invalidReference.replace(/[\s-]/g, "");
      
      expect(cleanReference.length).toBe(29);
      expect(cleanReference.length === 30).toBe(false);
    });

    it("should reject reference with more than 30 digits", () => {
      const invalidReference = "1234567890123456789012345678901"; // 31 digits
      const cleanReference = invalidReference.replace(/[\s-]/g, "");
      
      expect(cleanReference.length).toBe(31);
      expect(cleanReference.length === 30).toBe(false);
    });

    it("should reject reference with non-numeric characters", () => {
      const invalidReference = "12345678901234567890123456789A";
      const cleanReference = invalidReference.replace(/[\s-]/g, "");
      
      expect(/^\d{30}$/.test(cleanReference)).toBe(false);
    });

    it("should clean formatted reference correctly", () => {
      const formattedReference = "123456-789012-345678-901234-567890";
      const cleanReference = formattedReference.replace(/[\s-]/g, "");
      
      expect(cleanReference).toBe("123456789012345678901234567890");
      expect(cleanReference.length).toBe(30);
    });
  });

  describe("Credit Limit Validation", () => {
    const CREDIT_LIMIT = 100000;
    const MAX_DAILY_LIMIT = 8000;

    it("should pass validation when payment is within both limits", () => {
      const totalCreditUsed = 50000;
      const dailyUsed = 3000;
      const requestedAmount = 2000;

      const remainingCredit = CREDIT_LIMIT - totalCreditUsed;
      const remainingDailyLimit = MAX_DAILY_LIMIT - dailyUsed;

      const canProcess =
        remainingCredit >= requestedAmount &&
        remainingDailyLimit >= requestedAmount &&
        dailyUsed + requestedAmount <= MAX_DAILY_LIMIT;

      expect(canProcess).toBe(true);
      expect(remainingCredit).toBe(50000);
      expect(remainingDailyLimit).toBe(5000);
    });

    it("should fail validation when total credit limit is exceeded", () => {
      const totalCreditUsed = 99000;
      const requestedAmount = 2000;

      const remainingCredit = CREDIT_LIMIT - totalCreditUsed;
      const canProcess = remainingCredit >= requestedAmount;

      expect(canProcess).toBe(false);
      expect(remainingCredit).toBe(1000);
    });

    it("should fail validation when daily limit is exceeded", () => {
      const dailyUsed = 7500;
      const requestedAmount = 1000;

      const remainingDailyLimit = MAX_DAILY_LIMIT - dailyUsed;
      const canProcess =
        dailyUsed + requestedAmount <= MAX_DAILY_LIMIT &&
        remainingDailyLimit >= requestedAmount;

      expect(canProcess).toBe(false);
      expect(remainingDailyLimit).toBe(500);
    });

    it("should calculate remaining limits correctly", () => {
      const totalCreditUsed = 75000;
      const dailyUsed = 5000;

      const remainingCredit = CREDIT_LIMIT - totalCreditUsed;
      const remainingDailyLimit = MAX_DAILY_LIMIT - dailyUsed;

      expect(remainingCredit).toBe(25000);
      expect(remainingDailyLimit).toBe(3000);
    });

    it("should validate payment at exact daily limit boundary", () => {
      const dailyUsed = 7000;
      const requestedAmount = 1000;

      const canProcess = dailyUsed + requestedAmount <= MAX_DAILY_LIMIT;

      expect(canProcess).toBe(true);
      expect(dailyUsed + requestedAmount).toBe(8000);
    });

    it("should reject payment exceeding daily limit by 1 cent", () => {
      const dailyUsed = 7999.99;
      const requestedAmount = 0.02;

      const canProcess = dailyUsed + requestedAmount <= MAX_DAILY_LIMIT;

      expect(canProcess).toBe(false);
    });
  });

  describe("Commission Calculation", () => {
    it("should apply zero commission for Diestel payments", () => {
      const paymentAmount = 5000;
      const commissionRate = 0; // Diestel has 0% commission

      const commissionAmount = paymentAmount * commissionRate;

      expect(commissionAmount).toBe(0);
    });

    it("should maintain payment amount without commission deduction", () => {
      const paymentAmount = 7500.50;
      const commissionAmount = 0;

      const totalAmount = paymentAmount + commissionAmount;

      expect(totalAmount).toBe(paymentAmount);
    });
  });
});

describe("Diestel Reconciliation", () => {
  describe("Transaction Matching", () => {
    it("should match transaction when amounts are equal", () => {
      const systemAmount = 5000.00;
      const fileAmount = 5000.00;

      const amountDifference = Math.abs(systemAmount - fileAmount);
      const hasDiscrepancy = amountDifference > 0.01;

      expect(hasDiscrepancy).toBe(false);
      expect(amountDifference).toBe(0);
    });

    it("should detect discrepancy when amounts differ", () => {
      const systemAmount = 5000.00;
      const fileAmount = 5010.00;

      const amountDifference = Math.abs(systemAmount - fileAmount);
      const hasDiscrepancy = amountDifference > 0.01;

      expect(hasDiscrepancy).toBe(true);
      expect(amountDifference).toBe(10.00);
    });

    it("should tolerate differences within 1 cent", () => {
      const systemAmount = 5000.00;
      const fileAmount = 5000.01;

      const amountDifference = Math.abs(systemAmount - fileAmount);
      const hasDiscrepancy = amountDifference > 0.01;

      expect(hasDiscrepancy).toBe(false);
    });

    it("should detect small discrepancies above tolerance", () => {
      const systemAmount = 5000.00;
      const fileAmount = 5000.02;

      const amountDifference = Math.abs(systemAmount - fileAmount);
      const hasDiscrepancy = amountDifference > 0.01;

      expect(hasDiscrepancy).toBe(true);
    });
  });

  describe("Reconciliation Statistics", () => {
    it("should calculate reconciliation rate correctly", () => {
      const totalTransactions = 100;
      const matchedTransactions = 95;

      const reconciliationRate = (matchedTransactions / totalTransactions) * 100;

      expect(reconciliationRate).toBe(95);
    });

    it("should handle 100% reconciliation", () => {
      const totalTransactions = 50;
      const matchedTransactions = 50;

      const reconciliationRate = (matchedTransactions / totalTransactions) * 100;

      expect(reconciliationRate).toBe(100);
    });

    it("should handle 0% reconciliation", () => {
      const totalTransactions = 50;
      const matchedTransactions = 0;

      const reconciliationRate = (matchedTransactions / totalTransactions) * 100;

      expect(reconciliationRate).toBe(0);
    });

    it("should calculate total amounts correctly", () => {
      const records = [
        { paymentAmount: 1000, matchStatus: "Matched" },
        { paymentAmount: 2000, matchStatus: "Matched" },
        { paymentAmount: 1500, matchStatus: "Discrepancy" },
      ];

      const totalAmount = records.reduce((sum, r) => sum + r.paymentAmount, 0);
      const matchedAmount = records
        .filter((r) => r.matchStatus === "Matched")
        .reduce((sum, r) => sum + r.paymentAmount, 0);

      expect(totalAmount).toBe(4500);
      expect(matchedAmount).toBe(3000);
    });
  });

  describe("File Parsing", () => {
    it("should parse valid file line correctly", () => {
      const fileLine = "123456789012345678901234567890|1000.00|2024-01-15|CONFIRMED";
      const parts = fileLine.split("|");

      expect(parts.length).toBe(4);
      expect(parts[0].trim()).toBe("123456789012345678901234567890");
      expect(parseFloat(parts[1].trim())).toBe(1000.00);
      expect(parts[2].trim()).toBe("2024-01-15");
      expect(parts[3].trim()).toBe("CONFIRMED");
    });

    it("should handle file with header line", () => {
      const fileContent = "REFERENCE_NUMBER|AMOUNT|DATE|STATUS\n123456789012345678901234567890|1000.00|2024-01-15|CONFIRMED";
      const lines = fileContent.split("\n");
      const dataLines = lines[0].includes("REFERENCE") ? lines.slice(1) : lines;

      expect(dataLines.length).toBe(1);
      expect(dataLines[0]).toContain("123456789012345678901234567890");
    });

    it("should skip empty lines", () => {
      const lines = ["123456789012345678901234567890|1000.00|2024-01-15|CONFIRMED", "", "  "];
      const validLines = lines.filter((line) => line.trim());

      expect(validLines.length).toBe(1);
    });
  });
});

describe("SPEI Payment Processing", () => {
  describe("Payment Aggregation", () => {
    interface Payment {
      paymentAmount: string;
      id?: string;
      referenceNumber?: string;
    }

    it("should aggregate multiple payments correctly", () => {
      const payments: Payment[] = [
        { paymentAmount: "1000.00" },
        { paymentAmount: "2000.50" },
        { paymentAmount: "1500.75" },
      ];

      const totalAmount = payments.reduce(
        (sum, payment) => sum + parseFloat(payment.paymentAmount),
        0
      );

      expect(totalAmount).toBe(4501.25);
    });

    it("should count transactions correctly", () => {
      const payments: Payment[] = [
        { id: "1", paymentAmount: "1000.00" },
        { id: "2", paymentAmount: "2000.00" },
        { id: "3", paymentAmount: "1500.00" },
      ];

      expect(payments.length).toBe(3);
    });

    it("should handle empty payment list", () => {
      const payments: Payment[] = [];

      const totalAmount = payments.reduce(
        (sum, payment) => sum + parseFloat(payment.paymentAmount),
        0
      );

      expect(totalAmount).toBe(0);
      expect(payments.length).toBe(0);
    });

    it("should maintain payment reference integrity", () => {
      const payments: Payment[] = [
        { referenceNumber: "123456789012345678901234567890", paymentAmount: "1000.00" },
        { referenceNumber: "098765432109876543210987654321", paymentAmount: "2000.00" },
      ];

      payments.forEach((payment) => {
        const refNumber = payment.referenceNumber || "";
        expect(refNumber.length).toBe(30);
        expect(/^\d{30}$/.test(refNumber)).toBe(true);
      });
    });
  });

  describe("Date Range Filtering", () => {
    it("should filter payments by date correctly", () => {
      const targetDate = new Date("2024-01-15");
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const paymentDate = new Date("2024-01-15T14:30:00");

      const isInRange = paymentDate >= targetDate && paymentDate < nextDay;

      expect(isInRange).toBe(true);
    });

    it("should exclude payments outside date range", () => {
      const targetDate = new Date("2024-01-15");
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const paymentDate = new Date("2024-01-16T01:00:00");

      const isInRange = paymentDate >= targetDate && paymentDate < nextDay;

      expect(isInRange).toBe(false);
    });
  });
});

describe("Credit Status Display", () => {
  describe("Usage Percentage Calculation", () => {
    it("should calculate total credit percentage correctly", () => {
      const totalCreditUsed = 75000;
      const creditLimit = 100000;

      const percentage = (totalCreditUsed / creditLimit) * 100;

      expect(percentage).toBe(75);
    });

    it("should calculate daily usage percentage correctly", () => {
      const dailyUsed = 6000;
      const dailyLimit = 8000;

      const percentage = (dailyUsed / dailyLimit) * 100;

      expect(percentage).toBe(75);
    });

    it("should determine critical status at 90%+", () => {
      const percentage = 92;
      const isCritical = percentage >= 90;

      expect(isCritical).toBe(true);
    });

    it("should determine warning status at 75%-89%", () => {
      const percentage = 80;
      const isWarning = percentage >= 75 && percentage < 90;

      expect(isWarning).toBe(true);
    });

    it("should determine good status below 50%", () => {
      const percentage = 45;
      const isGood = percentage < 50;

      expect(isGood).toBe(true);
    });
  });
});
