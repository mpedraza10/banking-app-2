import type { PromotionalOffer } from "@/lib/actions/card-payments";

/**
 * Round amount to the nearest 0.50 increment (half peso)
 * Since the minimum denomination in Mexico is $0.50, all monetary values
 * should be in increments of 0.50
 * 
 * @param amount - The amount to round
 * @param direction - 'up' rounds up (ceil), 'down' rounds down (floor), 'nearest' rounds to nearest
 * @returns The amount rounded to the nearest 0.50 increment
 */
export function roundToHalfPeso(
  amount: number,
  direction: 'up' | 'down' | 'nearest' = 'nearest'
): number {
  const increment = 0.50;
  
  switch (direction) {
    case 'up':
      return Math.ceil(amount / increment) * increment;
    case 'down':
      return Math.floor(amount / increment) * increment;
    case 'nearest':
    default:
      return Math.round(amount / increment) * increment;
  }
}

/**
 * Round payment-related amounts appropriately based on context
 * - Amounts owed by customer: round UP (so bank doesn't lose money)
 * - Amounts available to customer: round DOWN (conservative estimate)
 */
export function roundPaymentAmounts(cardInfo: {
  currentBalance: number;
  minimumPayment: number;
  availableCredit: number;
  creditLimit: number;
}): {
  currentBalance: number;
  minimumPayment: number;
  availableCredit: number;
  creditLimit: number;
} {
  return {
    currentBalance: roundToHalfPeso(cardInfo.currentBalance, 'up'),
    minimumPayment: roundToHalfPeso(cardInfo.minimumPayment, 'up'),
    availableCredit: roundToHalfPeso(cardInfo.availableCredit, 'down'),
    creditLimit: roundToHalfPeso(cardInfo.creditLimit, 'nearest'),
  };
}

/**
 * Calculate payment with promotional offer applied
 * Returns final amount after discount
 */
export function calculatePaymentWithPromotion(
  paymentAmount: number,
  offer: PromotionalOffer
): { originalAmount: number; discount: number; finalAmount: number } {
  let discount = 0;

  if (offer.discountType === "percentage") {
    discount = (paymentAmount * offer.discountValue) / 100;
    if (offer.maxDiscount) {
      discount = Math.min(discount, offer.maxDiscount);
    }
  } else {
    discount = offer.discountValue;
  }

  const finalAmount = paymentAmount - discount;

  return {
    originalAmount: paymentAmount,
    discount,
    finalAmount: Math.max(finalAmount, 0),
  };
}
