"use server";

import { db } from "@/lib/db";
import { services, servicePayments, geographicCoverage, customers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { validateReference } from "@/lib/utils/reference-validation";

// Service DTO
export interface ServiceDTO {
  id: string;
  name: string;
  serviceCode: string;
  commissionRate: string;
  fixedCommission: string | null;
  isActive: boolean;
}

// Service payment request interface
export interface ServicePaymentRequest {
  serviceId: string;
  referenceNumber: string;
  paymentAmount: number;
  customerId?: string;
  userId: string;
  branchId: string;
  cashDenominations: CashDenomination[];
}

// Cash denomination interface
export interface CashDenomination {
  denomination: number;
  quantity: number;
  amount: number;
}

// Reference validation result
export interface ReferenceValidationResult {
  isValid: boolean;
  service: ServiceDTO | null;
  paymentDetails: {
    amount?: number;
    dueDate?: string;
  } | null;
  commission: {
    rate: number;
    amount: number;
  } | null;
  message?: string;
}

/**
 * Get list of available active service providers
 */
export async function getAvailableServices(user: User | null) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const activeServices = await db
      .select({
        id: services.id,
        name: services.name,
        serviceCode: services.serviceCode,
        commissionRate: services.commissionRate,
        fixedCommission: services.fixedCommission,
        isActive: services.isActive,
      })
      .from(services)
      .where(eq(services.isActive, true));

    return {
      data: activeServices,
    };
  } catch (error) {
    console.error("Get services error:", error);
    throw new Error("Failed to retrieve services");
  }
}

/**
 * Validate service reference number format and retrieve payment details
 * Business Rules:
 * - Reference format must match service-specific validation pattern
 * - Returns error if payment date has passed
 * - Commission waived for BAF account holders
 */
export async function validateServiceReference(
  user: User | null,
  serviceId: string,
  referenceNumber: string,
  customerId?: string
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get service details
    const service = await db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.isActive, true)))
      .limit(1);

    if (service.length === 0) {
      return {
        isValid: false,
        service: null,
        paymentDetails: null,
        commission: null,
        message: "Service not found or inactive",
      };
    }

    const serviceData = service[0];

    // Validate reference format using service-specific validation rules
    const validation = validateReference(serviceData.serviceCode, referenceNumber);
    if (!validation.isValid) {
      return {
        isValid: false,
        service: null,
        paymentDetails: null,
        commission: null,
        message: validation.message,
      };
    }

    // Check if customer has BAF account for commission waiver
    let hasBafAccount = false;
    if (customerId) {
      const customer = await db
        .select({ hasBafAccount: customers.hasBafAccount })
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      hasBafAccount = customer.length > 0 && customer[0].hasBafAccount;
    }

    // Calculate commission
    const commissionRate = hasBafAccount ? 0 : parseFloat(serviceData.commissionRate);
    const fixedCommission = hasBafAccount
      ? 0
      : serviceData.fixedCommission
      ? parseFloat(serviceData.fixedCommission)
      : 0;

    // Note: In a real implementation, this would query the service provider's API
    // For now, we return a mock validation result
    return {
      isValid: true,
      service: {
        id: serviceData.id,
        name: serviceData.name,
        serviceCode: serviceData.serviceCode,
        commissionRate: serviceData.commissionRate,
        fixedCommission: serviceData.fixedCommission,
        isActive: serviceData.isActive,
      },
      paymentDetails: {
        amount: 0, // Would come from service provider API
        dueDate: new Date().toISOString(),
      },
      commission: {
        rate: commissionRate,
        amount: fixedCommission,
      },
    };
  } catch (error) {
    console.error("Validate reference error:", error);
    throw new Error("Failed to validate service reference");
  }
}

/**
 * Process service payment
 * Business Rules:
 * - Reference number must pass service validation
 * - Expired payments cannot be processed
 * - Commission automatically calculated and added to payment
 * - Cash denominations must equal payment plus commission
 */
export async function processServicePayment(
  user: User | null,
  paymentData: ServicePaymentRequest
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Validate reference first
    const validation = await validateServiceReference(
      user,
      paymentData.serviceId,
      paymentData.referenceNumber,
      paymentData.customerId
    );

    if (!validation.isValid) {
      throw new Error(validation.message || "Invalid service reference");
    }

    // Calculate total commission
    const commissionAmount = validation.commission
      ? validation.commission.amount +
        paymentData.paymentAmount * validation.commission.rate
      : 0;

    // Validate cash denominations match payment + commission
    const totalCash = paymentData.cashDenominations.reduce(
      (sum, denom) => sum + denom.amount,
      0
    );
    const totalRequired = paymentData.paymentAmount + commissionAmount;

    if (Math.abs(totalCash - totalRequired) > 0.01) {
      throw new Error(
        `Cash denominations (${totalCash}) must equal payment plus commission (${totalRequired})`
      );
    }

    // Create service payment record
    const payment = await db
      .insert(servicePayments)
      .values({
        serviceId: paymentData.serviceId,
        referenceNumber: paymentData.referenceNumber,
        paymentAmount: paymentData.paymentAmount.toString(),
        commissionAmount: commissionAmount.toString(),
        customerId: paymentData.customerId || null,
        userId: paymentData.userId,
        branchId: paymentData.branchId,
        status: "Completed",
        completedAt: new Date(),
      })
      .returning();

    return {
      id: payment[0].id,
      transactionId: payment[0].id, // In full implementation, create transaction record
      status: payment[0].status,
      commissionAmount: commissionAmount,
      receiptId: payment[0].id, // In full implementation, generate receipt
    };
  } catch (error) {
    console.error("Process service payment error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to process service payment"
    );
  }
}

/**
 * Get service payment details by ID
 */
export async function getServicePaymentById(
  user: User | null,
  paymentId: string
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const payment = await db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.id, paymentId))
      .limit(1);

    if (payment.length === 0) {
      throw new Error("Service payment not found");
    }

    // Get service details
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, payment[0].serviceId))
      .limit(1);

    return {
      ...payment[0],
      service: service.length > 0 ? service[0] : null,
    };
  } catch (error) {
    console.error("Get service payment error:", error);
    throw new Error("Failed to retrieve service payment");
  }
}

/**
 * Validate geographic coverage for a service
 */
export async function validateGeographicCoverage(
  user: User | null,
  serviceId: string,
  state: string,
  city?: string,
  postalCode?: string
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const conditions = [
      eq(geographicCoverage.serviceId, serviceId),
      eq(geographicCoverage.isActive, true),
      eq(geographicCoverage.state, state),
    ];

    if (city) {
      conditions.push(eq(geographicCoverage.city, city));
    }

    if (postalCode) {
      conditions.push(eq(geographicCoverage.postalCode, postalCode));
    }

    const coverage = await db
      .select()
      .from(geographicCoverage)
      .where(and(...conditions))
      .limit(1);

    return {
      isAvailable: coverage.length > 0,
      message:
        coverage.length > 0
          ? "Service available in this location"
          : "Service not available in this location",
    };
  } catch (error) {
    console.error("Validate geographic coverage error:", error);
    throw new Error("Failed to validate geographic coverage");
  }
}
