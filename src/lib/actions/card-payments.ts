"use server";

import { db } from "@/lib/db";
import { cards, cardPayments, transactions, accounts, customers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

// Card information interface
export interface CardInfo {
  cardNumber: string;
  cardType: string;
  customerName: string;
  currentBalance: number;
  minimumPayment: number;
  statementDate: Date;
  dueDate: Date;
  creditLimit: number;
  availableCredit: number;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
}

// Payment type options
export type PaymentType = "minimum" | "total" | "custom";

// Card payment request interface
export interface CardPaymentRequest {
  cardId: string;
  paymentType: PaymentType;
  paymentAmount: number;
  customerId?: string;
  userId: string;
  branchId: string;
}

// Promotional offer interface
export interface PromotionalOffer {
  id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPaymentAmount?: number;
  maxDiscount?: number;
  validUntil: Date;
  applicableCardTypes?: string[];
}

/**
 * Get card information by card number
 * Validates card and retrieves account statement data
 */
export async function getCardInfo(user: User | null, cardNumber: string): Promise<CardInfo | null> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Clean card number (remove spaces and dashes)
    const cleanCardNumber = cardNumber.replace(/[\s-]/g, "");

    if (cleanCardNumber.length < 15 || cleanCardNumber.length > 16) {
      throw new Error("Invalid card number format");
    }

    // Search for card with account information
    const cardResult = await db
      .select({
        card: cards,
        account: accounts,
        customer: customers,
      })
      .from(cards)
      .innerJoin(accounts, eq(cards.accountId, accounts.id))
      .innerJoin(customers, eq(cards.customerId, customers.id))
      .where(eq(cards.cardNumber, cleanCardNumber))
      .limit(1);

    if (cardResult.length === 0) {
      return null;
    }

    const { card, account, customer } = cardResult[0];
    const currentBalance = parseFloat(account.balance);

    // Calculate minimum payment (typically 5% of balance or fixed amount)
    const minimumPaymentPercentage = 0.05;
    const minimumPaymentFixed = 200;
    const calculatedMinPayment = Math.max(
      currentBalance * minimumPaymentPercentage,
      minimumPaymentFixed
    );
    const minimumPayment = Math.min(calculatedMinPayment, currentBalance);

    // Calculate available credit (assuming creditLimit is stored in account or calculated)
    const creditLimit = 10000; // TODO: Get from account or card configuration
    const availableCredit = creditLimit - currentBalance;

    // Get last payment info
    const lastPayment = await db
      .select()
      .from(cardPayments)
      .where(eq(cardPayments.cardId, card.id))
      .orderBy(cardPayments.createdAt)
      .limit(1);

    return {
      cardNumber: card.cardNumber,
      cardType: card.cardType || "VISA",
      customerName: `${customer.firstName} ${customer.lastName}`,
      currentBalance: currentBalance,
      minimumPayment: minimumPayment,
      statementDate: new Date(), // TODO: Get from account statement cycle
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      creditLimit: creditLimit,
      availableCredit: availableCredit,
      lastPaymentDate: lastPayment[0]?.createdAt,
      lastPaymentAmount: lastPayment[0] ? parseFloat(lastPayment[0].paymentAmount) : undefined,
    };
  } catch (error) {
    console.error("Get card info error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to retrieve card information");
  }
}

/**
 * Get available promotional offers for card payment
 * Filters offers based on card type and payment amount
 */
export async function getPromotionalOffers(
  user: User | null,
  cardType: string,
  paymentAmount: number
): Promise<PromotionalOffer[]> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  // TODO: Implement database query for promotional offers
  // For now, return mock offers as placeholder
  const mockOffers: PromotionalOffer[] = [
    {
      id: "promo-1",
      title: "5% Cashback on Payments",
      description: "Get 5% cashback on card payments over $1,000",
      discountType: "percentage",
      discountValue: 5,
      minPaymentAmount: 1000,
      maxDiscount: 500,
      validUntil: new Date("2024-12-31"),
      applicableCardTypes: ["VISA", "MASTERCARD"],
    },
    {
      id: "promo-2",
      title: "$50 Discount on Total Payment",
      description: "Pay your total balance and get $50 off",
      discountType: "fixed",
      discountValue: 50,
      minPaymentAmount: 2000,
      validUntil: new Date("2024-12-31"),
      applicableCardTypes: undefined, // Applicable to all card types
    },
  ];

  // Filter offers based on card type and payment amount
  const applicableOffers = mockOffers.filter((offer) => {
    const isCardTypeMatch =
      !offer.applicableCardTypes || offer.applicableCardTypes.includes(cardType);
    const meetsMinimum = !offer.minPaymentAmount || paymentAmount >= offer.minPaymentAmount;
    const isValid = new Date() <= offer.validUntil;

    return isCardTypeMatch && meetsMinimum && isValid;
  });

  return applicableOffers;
}

/**
 * Validate card payment request
 * Ensures payment amount is valid and within acceptable ranges
 */
export async function validateCardPayment(
  user: User | null,
  cardNumber: string,
  paymentType: PaymentType,
  paymentAmount: number
): Promise<{ valid: boolean; message?: string }> {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get card information
    const cardInfo = await getCardInfo(user, cardNumber);

    if (!cardInfo) {
      return { valid: false, message: "Card not found" };
    }

    // Validate payment amount
    if (paymentAmount <= 0) {
      return { valid: false, message: "Payment amount must be greater than zero" };
    }

    if (paymentAmount > cardInfo.currentBalance) {
      return {
        valid: false,
        message: `Payment amount ($${paymentAmount.toFixed(2)}) exceeds current balance ($${cardInfo.currentBalance.toFixed(2)})`,
      };
    }

    // Validate based on payment type
    if (paymentType === "minimum") {
      if (paymentAmount < cardInfo.minimumPayment) {
        return {
          valid: false,
          message: `Minimum payment required: $${cardInfo.minimumPayment.toFixed(2)}`,
        };
      }
    }

    if (paymentType === "total") {
      if (Math.abs(paymentAmount - cardInfo.currentBalance) > 0.01) {
        return {
          valid: false,
          message: `Total payment must equal current balance: $${cardInfo.currentBalance.toFixed(2)}`,
        };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error("Validate card payment error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to validate card payment"
    );
  }
}

/**
 * Process card payment
 * Creates payment record and updates card balance
 */
export async function processCardPayment(
  user: User | null,
  paymentData: CardPaymentRequest,
  denominationDetails?: Record<string, number>
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Validate payment
    const validation = await validateCardPayment(
      user,
      paymentData.cardId,
      paymentData.paymentType,
      paymentData.paymentAmount
    );

    if (!validation.valid) {
      throw new Error(validation.message || "Payment validation failed");
    }

    // Get card with account information
    const cleanCardNumber = paymentData.cardId.replace(/[\s-]/g, "");
    const cardResult = await db
      .select({
        card: cards,
        account: accounts,
      })
      .from(cards)
      .innerJoin(accounts, eq(cards.accountId, accounts.id))
      .where(eq(cards.cardNumber, cleanCardNumber))
      .limit(1);

    if (cardResult.length === 0) {
      throw new Error("Card not found");
    }

    const { card, account } = cardResult[0];

    // Calculate new balance and available credit
    const currentBalance = parseFloat(account.balance);
    const newBalance = currentBalance - paymentData.paymentAmount;
    const creditLimit = 10000; // TODO: Get from account or card configuration
    const newAvailableCredit = creditLimit - newBalance;

    // Update account balance
    await db
      .update(accounts)
      .set({
        balance: newBalance.toString(),
      })
      .where(eq(accounts.id, account.id));

    // Create payment record
    // Note: In production, userId should map to systemUsers table
    // For now, we'll use a placeholder systemUser ID
    const payment = await db
      .insert(cardPayments)
      .values({
        cardId: card.id,
        accountId: account.id,
        paymentAmount: paymentData.paymentAmount.toString(),
        paymentType: paymentData.paymentType,
        cashReceived: "0", // TODO: Get from denomination details
        changeAmount: "0", // TODO: Calculate from cash received
        userId: paymentData.userId, // Note: This should be systemUsers.id in production
        branchId: paymentData.branchId,
        status: "Completed",
        completedAt: new Date(),
      })
      .returning();

    // Create transaction record
    const transactionNumber = `CP-${Date.now()}-${card.id.slice(0, 8)}`;
    const transaction = await db
      .insert(transactions)
      .values({
        transactionNumber,
        transactionType: "CardPayment",
        transactionStatus: "Posted",
        totalAmount: paymentData.paymentAmount.toString(),
        paymentMethod: "Cash",
        customerId: paymentData.customerId || null,
        userId: paymentData.userId,
        branchId: paymentData.branchId,
        postedAt: new Date(),
      })
      .returning();

    return {
      paymentId: payment[0].id,
      transactionId: transaction[0].id,
      previousBalance: currentBalance,
      paymentAmount: paymentData.paymentAmount,
      newBalance: newBalance,
      availableCredit: newAvailableCredit,
      paymentType: paymentData.paymentType,
      message: "Card payment processed successfully",
    };
  } catch (error) {
    console.error("Process card payment error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to process card payment"
    );
  }
}
