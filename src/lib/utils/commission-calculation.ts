/**
 * Commission Calculation Engine
 * 
 * Provides automatic commission calculation based on service type and payment amount.
 * Handles both percentage-based and fixed commission structures.
 */

// Commission structure types
export type CommissionType = "percentage" | "fixed" | "tiered" | "combined";

// Commission calculation result
export interface CommissionResult {
  commissionAmount: number;
  commissionRate: number;
  fixedAmount: number;
  totalPayable: number; // Payment amount + commission
  breakdown: CommissionBreakdown;
}

// Detailed commission breakdown
export interface CommissionBreakdown {
  baseAmount: number;        // Original payment amount
  percentageCommission: number; // Commission from percentage
  fixedCommission: number;   // Fixed commission amount
  totalCommission: number;   // Total commission
  waived: boolean;          // Whether commission was waived
  waiverReason?: string;    // Reason for waiver
}

// Service commission configuration
export interface ServiceCommissionConfig {
  commissionRate: number;    // Percentage rate (e.g., 0.02 for 2%)
  fixedCommission?: number;  // Fixed amount in pesos
  minCommission?: number;    // Minimum commission amount
  maxCommission?: number;    // Maximum commission amount
  commissionType: CommissionType;
}

/**
 * Calculate commission for a service payment
 * 
 * @param paymentAmount - The payment amount in pesos
 * @param config - Service commission configuration
 * @param hasBafAccount - Whether customer has BAF account (waives commission)
 * @returns Detailed commission calculation result
 */
export function calculateCommission(
  paymentAmount: number,
  config: ServiceCommissionConfig,
  hasBafAccount = false
): CommissionResult {
  // Initialize result
  let commissionAmount = 0;
  let percentageCommission = 0;
  let fixedCommission = 0;
  
  // If customer has BAF account, waive commission
  if (hasBafAccount) {
    return {
      commissionAmount: 0,
      commissionRate: 0,
      fixedAmount: 0,
      totalPayable: paymentAmount,
      breakdown: {
        baseAmount: paymentAmount,
        percentageCommission: 0,
        fixedCommission: 0,
        totalCommission: 0,
        waived: true,
        waiverReason: "BAF account holder - commission waived",
      },
    };
  }
  
  // Calculate based on commission type
  switch (config.commissionType) {
    case "percentage":
      percentageCommission = paymentAmount * config.commissionRate;
      commissionAmount = percentageCommission;
      break;
    
    case "fixed":
      fixedCommission = config.fixedCommission || 0;
      commissionAmount = fixedCommission;
      break;
    
    case "combined":
      // Both percentage and fixed commission apply
      percentageCommission = paymentAmount * config.commissionRate;
      fixedCommission = config.fixedCommission || 0;
      commissionAmount = percentageCommission + fixedCommission;
      break;
    
    case "tiered":
      // Tiered commission based on payment amount ranges
      // This would be expanded with specific tier rules per service
      percentageCommission = paymentAmount * config.commissionRate;
      commissionAmount = percentageCommission;
      break;
    
    default:
      commissionAmount = 0;
  }
  
  // Apply minimum commission if specified
  if (config.minCommission && commissionAmount < config.minCommission) {
    commissionAmount = config.minCommission;
  }
  
  // Apply maximum commission if specified
  if (config.maxCommission && commissionAmount > config.maxCommission) {
    commissionAmount = config.maxCommission;
  }
  
  // Round to 2 decimal places
  commissionAmount = Math.round(commissionAmount * 100) / 100;
  percentageCommission = Math.round(percentageCommission * 100) / 100;
  fixedCommission = Math.round(fixedCommission * 100) / 100;
  
  const totalPayable = paymentAmount + commissionAmount;
  
  return {
    commissionAmount,
    commissionRate: config.commissionRate,
    fixedAmount: config.fixedCommission || 0,
    totalPayable: Math.round(totalPayable * 100) / 100,
    breakdown: {
      baseAmount: paymentAmount,
      percentageCommission,
      fixedCommission,
      totalCommission: commissionAmount,
      waived: false,
    },
  };
}

/**
 * Calculate commission for multiple payments (batch processing)
 */
export function calculateBatchCommissions(
  payments: Array<{
    amount: number;
    serviceConfig: ServiceCommissionConfig;
    hasBafAccount?: boolean;
  }>
): {
  individual: CommissionResult[];
  totals: {
    totalPayments: number;
    totalCommissions: number;
    totalPayable: number;
    averageCommissionRate: number;
  };
} {
  const individual = payments.map((payment) =>
    calculateCommission(
      payment.amount,
      payment.serviceConfig,
      payment.hasBafAccount
    )
  );
  
  const totals = individual.reduce(
    (acc, result) => ({
      totalPayments: acc.totalPayments + result.breakdown.baseAmount,
      totalCommissions: acc.totalCommissions + result.commissionAmount,
      totalPayable: acc.totalPayable + result.totalPayable,
      averageCommissionRate: 0, // Calculated after reduce
    }),
    { totalPayments: 0, totalCommissions: 0, totalPayable: 0, averageCommissionRate: 0 }
  );
  
  // Calculate average commission rate
  totals.averageCommissionRate =
    totals.totalPayments > 0
      ? (totals.totalCommissions / totals.totalPayments) * 100
      : 0;
  
  return { individual, totals };
}

/**
 * Get commission configuration for a service
 * In a real implementation, this would fetch from database
 */
export function getServiceCommissionConfig(
  serviceCode: string,
  commissionRate: string,
  fixedCommission: string | null
): ServiceCommissionConfig {
  const rate = parseFloat(commissionRate);
  const fixed = fixedCommission ? parseFloat(fixedCommission) : undefined;
  
  // Determine commission type based on configuration
  let commissionType: CommissionType = "percentage";
  
  if (fixed && fixed > 0 && rate > 0) {
    commissionType = "combined";
  } else if (fixed && fixed > 0) {
    commissionType = "fixed";
  } else if (rate > 0) {
    commissionType = "percentage";
  }
  
  return {
    commissionRate: rate,
    fixedCommission: fixed,
    commissionType,
    // Service-specific limits could be added here
    minCommission: serviceCode === "DIESTEL" ? 10 : undefined,
    maxCommission: undefined,
  };
}

/**
 * Format commission for display
 */
export function formatCommission(commission: CommissionResult): {
  display: string;
  breakdown: string;
  tooltip: string;
} {
  const display = `$${commission.commissionAmount.toFixed(2)}`;
  
  let breakdown = "";
  if (commission.breakdown.percentageCommission > 0) {
    breakdown += `${(commission.commissionRate * 100).toFixed(2)}% = $${commission.breakdown.percentageCommission.toFixed(2)}`;
  }
  if (commission.breakdown.fixedCommission > 0) {
    if (breakdown) breakdown += " + ";
    breakdown += `Fixed: $${commission.breakdown.fixedCommission.toFixed(2)}`;
  }
  if (commission.breakdown.waived) {
    breakdown = "Waived (BAF Account)";
  }
  
  const tooltip = `
Base Amount: $${commission.breakdown.baseAmount.toFixed(2)}
${breakdown}
Total Commission: $${commission.commissionAmount.toFixed(2)}
Total Payable: $${commission.totalPayable.toFixed(2)}
  `.trim();
  
  return { display, breakdown, tooltip };
}

/**
 * Validate commission calculation
 * Ensures commission is within acceptable ranges
 */
export function validateCommission(
  commission: CommissionResult,
  maxAllowedRate = 0.1 // 10% max by default
): { isValid: boolean; message?: string } {
  // Check if commission rate is within acceptable range
  if (commission.commissionRate > maxAllowedRate) {
    return {
      isValid: false,
      message: `Commission rate ${(commission.commissionRate * 100).toFixed(2)}% exceeds maximum allowed ${(maxAllowedRate * 100).toFixed(2)}%`,
    };
  }
  
  // Check for negative values
  if (commission.commissionAmount < 0) {
    return {
      isValid: false,
      message: "Commission amount cannot be negative",
    };
  }
  
  // Check total payable is greater than base amount
  if (commission.totalPayable < commission.breakdown.baseAmount) {
    return {
      isValid: false,
      message: "Total payable cannot be less than base amount",
    };
  }
  
  return { isValid: true };
}
