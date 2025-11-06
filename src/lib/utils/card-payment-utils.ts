import type { PromotionalOffer } from "@/lib/actions/card-payments";

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
