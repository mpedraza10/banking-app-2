import { describe, it, expect } from "vitest";
import { AVAILABLE_DENOMINATIONS } from "../denominations";
import type {
  DenominationEntry,
  CashDrawerBalance,
} from "../denominations";

// Mock user for testing - not used directly but kept for reference
// const mockUser = {
//   id: "test-user-id",
//   email: "test@example.com",
// };

describe("Cash Denomination Tracking", () => {
  describe("Denomination Calculations", () => {
    it("should calculate total from denomination entries", () => {
      const denominations: DenominationEntry[] = [
        { denomination: 100, quantity: 2, amount: 200 },
        { denomination: 50, quantity: 1, amount: 50 },
        { denomination: 20, quantity: 3, amount: 60 },
      ];

      const total = denominations.reduce((sum, d) => sum + d.amount, 0);
      expect(total).toBe(310);
    });

    it("should validate denomination total matches expected amount", () => {
      const expectedAmount = 250;
      const denominations: DenominationEntry[] = [
        { denomination: 100, quantity: 2, amount: 200 },
        { denomination: 50, quantity: 1, amount: 50 },
      ];

      const total = denominations.reduce((sum, d) => sum + d.amount, 0);
      const isValid = Math.abs(total - expectedAmount) < 0.01;

      expect(isValid).toBe(true);
    });

    it("should detect mismatch between denomination total and expected amount", () => {
      const expectedAmount = 300;
      const denominations: DenominationEntry[] = [
        { denomination: 100, quantity: 2, amount: 200 },
        { denomination: 50, quantity: 1, amount: 50 },
      ];

      const total = denominations.reduce((sum, d) => sum + d.amount, 0);
      const isValid = Math.abs(total - expectedAmount) < 0.01;

      expect(isValid).toBe(false);
    });

    it("should handle decimal denominations correctly", () => {
      const denominations: DenominationEntry[] = [
        { denomination: 5, quantity: 3, amount: 15 },
        { denomination: 2, quantity: 2, amount: 4 },
        { denomination: 1, quantity: 1, amount: 1 },
        { denomination: 0.5, quantity: 4, amount: 2 },
      ];

      const total = denominations.reduce((sum, d) => sum + d.amount, 0);
      expect(total).toBe(22);
    });
  });

  describe("Change Calculation", () => {
    it("should calculate change from cash received and payment amount", () => {
      const cashReceived = 500;
      const paymentAmount = 425.5;
      const change = cashReceived - paymentAmount;

      expect(change).toBe(74.5);
    });

    it("should handle exact payment with no change", () => {
      const cashReceived = 100;
      const paymentAmount = 100;
      const change = cashReceived - paymentAmount;

      expect(change).toBe(0);
    });

    it("should calculate change for multiple transaction types", () => {
      const scenarios = [
        { received: 1000, payment: 925.31, expectedChange: 74.69 },
        { received: 500, payment: 475, expectedChange: 25 },
        { received: 200, payment: 174.5, expectedChange: 25.5 },
      ];

      scenarios.forEach((scenario) => {
        const change = scenario.received - scenario.payment;
        expect(change).toBeCloseTo(scenario.expectedChange, 2);
      });
    });
  });

  describe("Inventory Validation", () => {
    it("should detect sufficient denominations for change", () => {
      const currentBalance: CashDrawerBalance[] = [
        { denomination: 20, quantity: 21, amount: 420 },
        { denomination: 10, quantity: 92, amount: 920 },
        { denomination: 5, quantity: 87, amount: 435 },
        { denomination: 2, quantity: 83, amount: 166 },
        { denomination: 1, quantity: 91, amount: 91 },
        { denomination: 0.5, quantity: 75, amount: 37.5 },
        { denomination: 0.2, quantity: 98, amount: 19.6 },
        { denomination: 0.1, quantity: 90, amount: 9 },
      ];

      const requiredDenominations: DenominationEntry[] = [
        { denomination: 20, quantity: 1, amount: 20 },
        { denomination: 0.2, quantity: 1, amount: 0.2 },
        { denomination: 0.1, quantity: 1, amount: 0.1 },
      ];

      const balanceMap = new Map(
        currentBalance.map((item) => [item.denomination, item.quantity])
      );

      const isAvailable = requiredDenominations.every((required) => {
        const available = balanceMap.get(required.denomination) || 0;
        return available >= required.quantity;
      });

      expect(isAvailable).toBe(true);
    });

    it("should detect insufficient denominations for change", () => {
      const currentBalance: CashDrawerBalance[] = [
        { denomination: 100, quantity: 12, amount: 1200 },
        { denomination: 50, quantity: 7, amount: 350 },
        { denomination: 20, quantity: 0, amount: 0 }, // Insufficient
      ];

      const requiredDenominations: DenominationEntry[] = [
        { denomination: 20, quantity: 1, amount: 20 },
      ];

      const balanceMap = new Map(
        currentBalance.map((item) => [item.denomination, item.quantity])
      );

      const deficientDenominations = requiredDenominations
        .filter((required) => {
          const available = balanceMap.get(required.denomination) || 0;
          return available < required.quantity;
        })
        .map((d) => d.denomination);

      expect(deficientDenominations).toContain(20);
    });

    it("should identify multiple deficient denominations", () => {
      const currentBalance: CashDrawerBalance[] = [
        { denomination: 100, quantity: 5, amount: 500 },
        { denomination: 50, quantity: 2, amount: 100 }, // Insufficient
        { denomination: 20, quantity: 0, amount: 0 }, // Insufficient
        { denomination: 10, quantity: 10, amount: 100 },
      ];

      const requiredDenominations: DenominationEntry[] = [
        { denomination: 50, quantity: 5, amount: 250 }, // Need 5, have 2
        { denomination: 20, quantity: 3, amount: 60 }, // Need 3, have 0
      ];

      const balanceMap = new Map(
        currentBalance.map((item) => [item.denomination, item.quantity])
      );

      const deficientDenominations = requiredDenominations
        .filter((required) => {
          const available = balanceMap.get(required.denomination) || 0;
          return available < required.quantity;
        })
        .map((d) => d.denomination);

      expect(deficientDenominations).toContain(50);
      expect(deficientDenominations).toContain(20);
      expect(deficientDenominations.length).toBe(2);
    });
  });

  describe("Inventory Updates", () => {
    it("should add denominations when cash is received", () => {
      const currentBalance = {
        denomination: 100,
        quantity: 10,
        amount: 1000,
      };

      const received: DenominationEntry = {
        denomination: 100,
        quantity: 2,
        amount: 200,
      };

      const newQuantity = currentBalance.quantity + received.quantity;
      const newAmount = currentBalance.amount + received.amount;

      expect(newQuantity).toBe(12);
      expect(newAmount).toBe(1200);
    });

    it("should subtract denominations when change is dispensed", () => {
      const currentBalance = {
        denomination: 50,
        quantity: 10,
        amount: 500,
      };

      const dispensed: DenominationEntry = {
        denomination: 50,
        quantity: 3,
        amount: 150,
      };

      const newQuantity = currentBalance.quantity - dispensed.quantity;
      const newAmount = currentBalance.amount - dispensed.amount;

      expect(newQuantity).toBe(7);
      expect(newAmount).toBe(350);
    });

    it("should handle multiple denomination updates in a transaction", () => {
      const updates = [
        {
          denomination: 100,
          operation: "add" as const,
          quantity: 1,
          currentQty: 10,
        },
        {
          denomination: 20,
          operation: "subtract" as const,
          quantity: 1,
          currentQty: 21,
        },
        {
          denomination: 0.1,
          operation: "subtract" as const,
          quantity: 1,
          currentQty: 90,
        },
      ];

      const results = updates.map((update) => ({
        denomination: update.denomination,
        newQuantity:
          update.operation === "add"
            ? update.currentQty + update.quantity
            : update.currentQty - update.quantity,
      }));

      expect(results[0].newQuantity).toBe(11); // 100 peso bill added
      expect(results[1].newQuantity).toBe(20); // 20 peso bill removed
      expect(results[2].newQuantity).toBe(89); // 0.1 peso coin removed
    });
  });

  describe("Optimal Change Algorithm", () => {
    it("should use largest denominations first", () => {
      const changeAmount = 175;
      const result: DenominationEntry[] = [];
      let remaining = changeAmount;

      // Simulate greedy algorithm
      const availableDenominations = [100, 50, 20, 10, 5];

      for (const denom of availableDenominations) {
        if (remaining >= denom) {
          const quantity = Math.floor(remaining / denom);
          if (quantity > 0) {
            result.push({
              denomination: denom,
              quantity,
              amount: denom * quantity,
            });
            remaining -= denom * quantity;
          }
        }
      }

      expect(result[0].denomination).toBe(100); // Largest first
      expect(result[0].quantity).toBe(1);
      expect(result[1].denomination).toBe(50);
      expect(result[1].quantity).toBe(1);
      expect(result[2].denomination).toBe(20);
      expect(result[2].quantity).toBe(1);
      expect(result[3].denomination).toBe(5);
      expect(result[3].quantity).toBe(1);
      expect(remaining).toBe(0);
    });

    it("should respect available inventory when calculating optimal change", () => {
      const changeAmount = 100;
      const availableInventory = new Map([
        [100, 0], // Not available
        [50, 5],
        [20, 10],
      ]);

      const result: DenominationEntry[] = [];
      let remaining = changeAmount;

      for (const [denom, available] of Array.from(availableInventory.entries()).sort(
        (a, b) => b[0] - a[0]
      )) {
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

      // Should use 2x50 instead of 1x100 (not available)
      expect(result[0].denomination).toBe(50);
      expect(result[0].quantity).toBe(2);
      expect(remaining).toBe(0);
    });
  });

  describe("Reconciliation Logic", () => {
    it("should calculate differences between expected and actual counts", () => {
      const expected = { denomination: 100, quantity: 10, amount: 1000 };
      const actual = { denomination: 100, quantity: 12, amount: 1200 };

      const difference = {
        quantityDiff: actual.quantity - expected.quantity,
        amountDiff: actual.amount - expected.amount,
      };

      expect(difference.quantityDiff).toBe(2);
      expect(difference.amountDiff).toBe(200);
    });

    it("should identify discrepancies in reconciliation", () => {
      const reconciliationData = [
        {
          denomination: 100,
          expected: 10,
          actual: 10,
          difference: 0,
        },
        {
          denomination: 50,
          expected: 5,
          actual: 4,
          difference: -1,
        },
        {
          denomination: 20,
          expected: 15,
          actual: 17,
          difference: 2,
        },
      ];

      const hasDiscrepancies = reconciliationData.some(
        (item) => item.difference !== 0
      );

      const discrepancyCount = reconciliationData.filter(
        (item) => item.difference !== 0
      ).length;

      expect(hasDiscrepancies).toBe(true);
      expect(discrepancyCount).toBe(2);
    });

    it("should calculate total variance in reconciliation", () => {
      const reconciliationData = [
        { denomination: 100, expectedAmount: 1000, actualAmount: 1000 },
        { denomination: 50, expectedAmount: 250, actualAmount: 200 },
        { denomination: 20, expectedAmount: 300, actualAmount: 340 },
      ];

      const totalExpected = reconciliationData.reduce(
        (sum, item) => sum + item.expectedAmount,
        0
      );
      const totalActual = reconciliationData.reduce(
        (sum, item) => sum + item.actualAmount,
        0
      );
      const variance = totalActual - totalExpected;

      expect(totalExpected).toBe(1550);
      expect(totalActual).toBe(1540);
      expect(variance).toBe(-10); // $10 short
    });
  });

  describe("Available Denominations", () => {
    it("should include all standard Mexican currency denominations", () => {
      const expectedDenominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];

      expectedDenominations.forEach((denom) => {
        expect(AVAILABLE_DENOMINATIONS).toContain(denom);
      });

      expect(AVAILABLE_DENOMINATIONS.length).toBe(expectedDenominations.length);
    });

    it("should have denominations sorted in descending order", () => {
      const sorted = [...AVAILABLE_DENOMINATIONS].sort((a, b) => b - a);
      expect(AVAILABLE_DENOMINATIONS).toEqual(sorted);
    });
  });
});
