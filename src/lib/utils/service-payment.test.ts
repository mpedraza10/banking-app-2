import { describe, it, expect } from "vitest";
import {
  validateReference,
  formatReference,
  hasValidationRules,
  extractReferenceInfo,
} from "@/lib/utils/reference-validation";
import {
  calculateCommission,
  calculateBatchCommissions,
  getServiceCommissionConfig,
  validateCommission,
  formatCommission,
} from "@/lib/utils/commission-calculation";
import type { ServiceCommissionConfig } from "@/lib/utils/commission-calculation";

// ==================== REFERENCE VALIDATION TESTS ====================

describe("Reference Validation", () => {
  describe("validateReference", () => {
    it("should validate CFE reference with 12 digits", () => {
      const result = validateReference("CFE", "123456789012");
      expect(result.isValid).toBe(true);
    });

    it("should reject CFE reference with incorrect length", () => {
      const result = validateReference("CFE", "12345678901");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("12 characters");
    });

    it("should validate Telmex reference with 10 digits", () => {
      const result = validateReference("TELMEX", "1234567890");
      expect(result.isValid).toBe(true);
    });

    it("should reject Telmex reference with non-numeric characters", () => {
      const result = validateReference("TELMEX", "12345ABC90");
      expect(result.isValid).toBe(false);
    });

    it("should validate Diestel reference with 30 digits", () => {
      // Valid Luhn checksum example
      const result = validateReference("DIESTEL", "123456789012345678901234567890");
      expect(result.isValid).toBe(true);
    });

    it("should reject Diestel reference with invalid checksum", () => {
      const result = validateReference("DIESTEL", "123456789012345678901234567891");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("checksum");
    });

    it("should handle references with spaces and hyphens", () => {
      const result = validateReference("TELMEX", "12-3456-7890");
      expect(result.isValid).toBe(true);
    });
  });

  describe("formatReference", () => {
    it("should format CFE reference", () => {
      const formatted = formatReference("CFE", "123456789012");
      expect(formatted).toBe("1234-5678-9012");
    });

    it("should format Telmex reference", () => {
      const formatted = formatReference("TELMEX", "1234567890");
      expect(formatted).toBe("12-3456-7890");
    });

    it("should format Diestel reference", () => {
      const formatted = formatReference("DIESTEL", "123456789012345678901234567890");
      expect(formatted).toBe("123456-789012-345678-901234-567890");
    });
  });

  describe("hasValidationRules", () => {
    it("should return true for services with rules", () => {
      expect(hasValidationRules("CFE")).toBe(true);
      expect(hasValidationRules("TELMEX")).toBe(true);
      expect(hasValidationRules("DIESTEL")).toBe(true);
    });

    it("should return false for services without rules", () => {
      expect(hasValidationRules("UNKNOWN_SERVICE")).toBe(false);
    });

    it("should be case-insensitive", () => {
      expect(hasValidationRules("cfe")).toBe(true);
      expect(hasValidationRules("Telmex")).toBe(true);
    });
  });

  describe("extractReferenceInfo", () => {
    it("should extract Diestel reference components", () => {
      const info = extractReferenceInfo("DIESTEL", "123456789012345678901234567890");
      expect(info).toHaveProperty("region");
      expect(info).toHaveProperty("account");
      expect(info).toHaveProperty("transactionInfo");
      expect(info.region).toBe("123456");
      expect(info.account).toBe("789012");
    });

    it("should return empty object for references without metadata", () => {
      const info = extractReferenceInfo("CFE", "123456789012");
      expect(Object.keys(info)).toHaveLength(0);
    });
  });
});

// ==================== COMMISSION CALCULATION TESTS ====================

describe("Commission Calculation", () => {
  const mockPercentageConfig: ServiceCommissionConfig = {
    commissionRate: 0.02, // 2%
    commissionType: "percentage",
  };

  const mockFixedConfig: ServiceCommissionConfig = {
    commissionRate: 0,
    fixedCommission: 15,
    commissionType: "fixed",
  };

  const mockCombinedConfig: ServiceCommissionConfig = {
    commissionRate: 0.015, // 1.5%
    fixedCommission: 10,
    commissionType: "combined",
  };

  describe("calculateCommission", () => {
    it("should calculate percentage-based commission correctly", () => {
      const result = calculateCommission(1000, mockPercentageConfig);
      expect(result.commissionAmount).toBe(20);
      expect(result.totalPayable).toBe(1020);
      expect(result.breakdown.percentageCommission).toBe(20);
      expect(result.breakdown.fixedCommission).toBe(0);
    });

    it("should calculate fixed commission correctly", () => {
      const result = calculateCommission(1000, mockFixedConfig);
      expect(result.commissionAmount).toBe(15);
      expect(result.totalPayable).toBe(1015);
      expect(result.breakdown.percentageCommission).toBe(0);
      expect(result.breakdown.fixedCommission).toBe(15);
    });

    it("should calculate combined commission correctly", () => {
      const result = calculateCommission(1000, mockCombinedConfig);
      expect(result.commissionAmount).toBe(25); // 15 + 10
      expect(result.totalPayable).toBe(1025);
      expect(result.breakdown.percentageCommission).toBe(15);
      expect(result.breakdown.fixedCommission).toBe(10);
    });

    it("should waive commission for BAF account holders", () => {
      const result = calculateCommission(1000, mockPercentageConfig, true);
      expect(result.commissionAmount).toBe(0);
      expect(result.totalPayable).toBe(1000);
      expect(result.breakdown.waived).toBe(true);
      expect(result.breakdown.waiverReason).toContain("BAF account");
    });

    it("should respect minimum commission", () => {
      const configWithMin: ServiceCommissionConfig = {
        ...mockPercentageConfig,
        minCommission: 50,
      };
      const result = calculateCommission(100, configWithMin);
      expect(result.commissionAmount).toBe(50); // 2% of 100 is 2, but min is 50
    });

    it("should respect maximum commission", () => {
      const configWithMax: ServiceCommissionConfig = {
        ...mockPercentageConfig,
        maxCommission: 10,
      };
      const result = calculateCommission(1000, configWithMax);
      expect(result.commissionAmount).toBe(10); // 2% of 1000 is 20, but max is 10
    });

    it("should round to 2 decimal places", () => {
      const result = calculateCommission(333.33, mockPercentageConfig);
      expect(result.commissionAmount).toBe(6.67); // 2% of 333.33
      expect(result.totalPayable).toBe(340);
    });
  });

  describe("calculateBatchCommissions", () => {
    it("should calculate commissions for multiple payments", () => {
      const payments = [
        { amount: 1000, serviceConfig: mockPercentageConfig },
        { amount: 500, serviceConfig: mockFixedConfig },
        { amount: 2000, serviceConfig: mockCombinedConfig },
      ];

      const result = calculateBatchCommissions(payments);
      
      expect(result.individual).toHaveLength(3);
      expect(result.totals.totalPayments).toBe(3500);
      expect(result.totals.totalCommissions).toBe(20 + 15 + 40); // 75
      expect(result.totals.totalPayable).toBe(3575);
    });

    it("should calculate average commission rate", () => {
      const payments = [
        { amount: 1000, serviceConfig: mockPercentageConfig },
        { amount: 1000, serviceConfig: mockPercentageConfig },
      ];

      const result = calculateBatchCommissions(payments);
      expect(result.totals.averageCommissionRate).toBeCloseTo(2, 2);
    });

    it("should handle empty payment array", () => {
      const result = calculateBatchCommissions([]);
      expect(result.individual).toHaveLength(0);
      expect(result.totals.totalPayments).toBe(0);
      expect(result.totals.averageCommissionRate).toBe(0);
    });
  });

  describe("getServiceCommissionConfig", () => {
    it("should create percentage config", () => {
      const config = getServiceCommissionConfig("CFE", "0.02", null);
      expect(config.commissionType).toBe("percentage");
      expect(config.commissionRate).toBe(0.02);
    });

    it("should create fixed config", () => {
      const config = getServiceCommissionConfig("TELMEX", "0", "15");
      expect(config.commissionType).toBe("fixed");
      expect(config.fixedCommission).toBe(15);
    });

    it("should create combined config", () => {
      const config = getServiceCommissionConfig("GNM", "0.015", "10");
      expect(config.commissionType).toBe("combined");
      expect(config.commissionRate).toBe(0.015);
      expect(config.fixedCommission).toBe(10);
    });

    it("should add service-specific limits", () => {
      const config = getServiceCommissionConfig("DIESTEL", "0.02", null);
      expect(config.minCommission).toBe(10);
    });
  });

  describe("validateCommission", () => {
    it("should validate normal commission", () => {
      const commission = calculateCommission(1000, mockPercentageConfig);
      const result = validateCommission(commission);
      expect(result.isValid).toBe(true);
    });

    it("should reject commission with excessive rate", () => {
      const highRateConfig: ServiceCommissionConfig = {
        commissionRate: 0.15, // 15%
        commissionType: "percentage",
      };
      const commission = calculateCommission(1000, highRateConfig);
      const result = validateCommission(commission, 0.1); // 10% max
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("exceeds maximum");
    });

    it("should reject negative commission", () => {
      const commission = {
        commissionAmount: -10,
        commissionRate: 0.02,
        fixedAmount: 0,
        totalPayable: 990,
        breakdown: {
          baseAmount: 1000,
          percentageCommission: -10,
          fixedCommission: 0,
          totalCommission: -10,
          waived: false,
        },
      };
      const result = validateCommission(commission);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("negative");
    });
  });

  describe("formatCommission", () => {
    it("should format percentage commission", () => {
      const commission = calculateCommission(1000, mockPercentageConfig);
      const formatted = formatCommission(commission);
      expect(formatted.display).toBe("$20.00");
      expect(formatted.breakdown).toContain("2.00%");
    });

    it("should format fixed commission", () => {
      const commission = calculateCommission(1000, mockFixedConfig);
      const formatted = formatCommission(commission);
      expect(formatted.display).toBe("$15.00");
      expect(formatted.breakdown).toContain("Fixed");
    });

    it("should format combined commission", () => {
      const commission = calculateCommission(1000, mockCombinedConfig);
      const formatted = formatCommission(commission);
      expect(formatted.breakdown).toContain("1.50%");
      expect(formatted.breakdown).toContain("Fixed");
    });

    it("should format waived commission", () => {
      const commission = calculateCommission(1000, mockPercentageConfig, true);
      const formatted = formatCommission(commission);
      expect(formatted.breakdown).toContain("Waived");
    });
  });
});
