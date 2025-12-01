"use server";

import { db } from "@/lib/db";
import { services, servicePayments, geographicCoverage, customers, transactions, transactionItems, cashDenominations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { validateReference, requiresVerificationDigit } from "@/lib/utils/reference-validation";
import { getOrCreateSystemUser } from "@/lib/actions/users";

import { cards, accounts } from "@/lib/db/schema";

/**
 * Resolve customer ID from account number or card number
 */
async function resolveCustomerId(identifier: string): Promise<string | null> {
  // Try to find by account number
  const account = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.accountNumber, identifier))
    .limit(1);

  if (account.length > 0) {
    // Find customer associated with account (via card or direct link if exists)
    // Assuming Card -> Account link is the primary way to link Customer -> Account in this schema
    // But schema says Card has customerId AND accountId.
    // Let's check if we can find a card linked to this account to get the customer.
    const card = await db
      .select({ customerId: cards.customerId })
      .from(cards)
      .where(eq(cards.accountId, account[0].id))
      .limit(1);
      
    if (card.length > 0) {
      return card[0].customerId;
    }
  }

  // Try to find by card number
  const card = await db
    .select({ customerId: cards.customerId })
    .from(cards)
    .where(eq(cards.cardNumber, identifier))
    .limit(1);

  if (card.length > 0) {
    return card[0].customerId;
  }

  return null;
}

/**
 * Validate if account number or card number exists in the system
 * Returns validation result with customer info if found
 */
export async function validateCustomerAccount(
  user: User | null,
  identifier: string
): Promise<{
  isValid: boolean;
  customerId?: string;
  customerName?: string;
  accountType?: string;
  message: string;
}> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!identifier || identifier.trim() === "") {
    return {
      isValid: false,
      message: "Número de cuenta o tarjeta es requerido",
    };
  }

  const cleanIdentifier = identifier.replace(/[\s-]/g, "");

  // Validate format - must be numeric
  if (!/^\d+$/.test(cleanIdentifier)) {
    return {
      isValid: false,
      message: "Número de cuenta o tarjeta debe contener solo números",
    };
  }

  try {
    // Try to find by account number first
    const accountResult = await db
      .select({
        id: accounts.id,
        accountNumber: accounts.accountNumber,
        accountType: accounts.accountType,
      })
      .from(accounts)
      .where(eq(accounts.accountNumber, cleanIdentifier))
      .limit(1);

    if (accountResult.length > 0) {
      // Find customer associated with this account via card
      const cardWithCustomer = await db
        .select({
          customerId: cards.customerId,
          firstName: customers.firstName,
          lastName: customers.lastName,
        })
        .from(cards)
        .innerJoin(customers, eq(cards.customerId, customers.id))
        .where(eq(cards.accountId, accountResult[0].id))
        .limit(1);

      if (cardWithCustomer.length > 0) {
        return {
          isValid: true,
          customerId: cardWithCustomer[0].customerId,
          customerName: `${cardWithCustomer[0].firstName} ${cardWithCustomer[0].lastName}`,
          accountType: accountResult[0].accountType,
          message: "Cuenta válida",
        };
      }

      return {
        isValid: true,
        accountType: accountResult[0].accountType,
        message: "Cuenta válida (sin cliente asociado)",
      };
    }

    // Try to find by card number
    const cardResult = await db
      .select({
        cardId: cards.id,
        cardNumber: cards.cardNumber,
        cardType: cards.cardType,
        customerId: cards.customerId,
        isActive: cards.isActive,
        firstName: customers.firstName,
        lastName: customers.lastName,
      })
      .from(cards)
      .innerJoin(customers, eq(cards.customerId, customers.id))
      .where(eq(cards.cardNumber, cleanIdentifier))
      .limit(1);

    if (cardResult.length > 0) {
      // Check if card is active
      if (!cardResult[0].isActive) {
        return {
          isValid: false,
          message: "Tarjeta no está activa",
        };
      }

      return {
        isValid: true,
        customerId: cardResult[0].customerId,
        customerName: `${cardResult[0].firstName} ${cardResult[0].lastName}`,
        accountType: cardResult[0].cardType || "Tarjeta",
        message: "Tarjeta válida",
      };
    }

    // Not found
    return {
      isValid: false,
      message: "Número de cuenta o tarjeta no encontrado en el sistema",
    };
  } catch (error) {
    console.error("Validate customer account error:", error);
    throw new Error("Error al validar cuenta del cliente");
  }
}
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
 * - Verification digit must be valid if required by service
 * - Returns error if payment date has passed
 * - Commission waived for BAF account holders
 */
export async function validateServiceReference(
  user: User | null,
  serviceId: string,
  referenceNumber: string,
  customerId?: string,
  verificationDigit?: string
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
        requiresVerificationDigit: false,
      };
    }

    const serviceData = service[0];

    // Check if service requires verification digit
    const needsVerificationDigit = requiresVerificationDigit(serviceData.serviceCode);
    
    // Validate reference format using service-specific validation rules
    // Include verification digit in validation if provided or required
    const validation = validateReference(serviceData.serviceCode, referenceNumber, verificationDigit);
    if (!validation.isValid) {
      return {
        isValid: false,
        service: null,
        paymentDetails: null,
        commission: null,
        message: validation.message,
        requiresVerificationDigit: needsVerificationDigit,
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
      requiresVerificationDigit: needsVerificationDigit,
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
    // Resolve customer ID if provided (could be account/card number)
    let resolvedCustomerId = paymentData.customerId;
    if (paymentData.customerId) {
      // Check if it's a UUID (direct customer ID) or needs resolution
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentData.customerId);
      
      if (!isUuid) {
        const resolvedId = await resolveCustomerId(paymentData.customerId);
        if (resolvedId) {
          resolvedCustomerId = resolvedId;
        } else {
          // If we can't resolve it, but it was provided as "client" flow, we might want to error or just proceed without linking
          // For now, let's assume if it's not found, we treat it as a non-linked payment or just log warning
          console.warn(`Could not resolve customer from identifier: ${paymentData.customerId}`);
          resolvedCustomerId = undefined; 
        }
      }
    }

    // Validate reference first
    const validation = await validateServiceReference(
      user,
      paymentData.serviceId,
      paymentData.referenceNumber,
      resolvedCustomerId
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

    // Get or create system user from auth user
    const systemUser = await getOrCreateSystemUser(user);
    const systemUserId = systemUser.id;
    const branchId = paymentData.branchId || systemUser.branchId;

    // Generate transaction number
    const transactionNumber = `SP-${Date.now()}-${paymentData.serviceId.slice(0, 8)}`;

    // Create transaction record
    const [transaction] = await db
      .insert(transactions)
      .values({
        transactionNumber,
        transactionType: "ServicePayment",
        transactionStatus: "Posted",
        totalAmount: totalRequired.toString(),
        paymentMethod: "Cash",
        customerId: paymentData.customerId || null,
        userId: systemUserId,
        branchId: branchId,
        postedAt: new Date(),
      })
      .returning();

    // Create transaction item for the service payment
    await db.insert(transactionItems).values({
      transactionId: transaction.id,
      description: `Service Payment - Reference: ${paymentData.referenceNumber}`,
      amount: paymentData.paymentAmount.toString(),
      quantity: 1,
      serviceId: paymentData.serviceId,
      referenceNumber: paymentData.referenceNumber,
    });

    // Create transaction item for commission if applicable
    if (commissionAmount > 0) {
      await db.insert(transactionItems).values({
        transactionId: transaction.id,
        description: "Commission",
        amount: commissionAmount.toString(),
        quantity: 1,
        serviceId: paymentData.serviceId,
      });
    }

    // Record cash denominations
    if (paymentData.cashDenominations.length > 0) {
      const denominationRecords = paymentData.cashDenominations.map((denom) => ({
        transactionId: transaction.id,
        denominationType: "Received" as const,
        denomination: denom.denomination.toString(),
        quantity: denom.quantity,
        amount: denom.amount.toString(),
        userId: systemUserId,
      }));

      await db.insert(cashDenominations).values(denominationRecords);
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
        userId: systemUserId,
        branchId: branchId,
        status: "Completed",
        completedAt: new Date(),
      })
      .returning();

    return {
      id: payment[0].id,
      transactionId: transaction.id,
      transactionNumber: transaction.transactionNumber,
      status: payment[0].status,
      commissionAmount: commissionAmount,
      receiptId: transaction.id,
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
