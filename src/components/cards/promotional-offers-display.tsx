"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { PromotionalOffer } from "@/lib/actions/card-payments";
import { calculatePaymentWithPromotion } from "@/lib/utils/card-payment-utils";

interface PromotionalOffersDisplayProps {
  offers: PromotionalOffer[];
  paymentAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOffer?: (offer: PromotionalOffer) => void;
}

export function PromotionalOffersDisplay({
  offers,
  paymentAmount,
  open,
  onOpenChange,
  onSelectOffer,
}: PromotionalOffersDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSelectOffer = (offer: PromotionalOffer) => {
    if (onSelectOffer) {
      onSelectOffer(offer);
    }
    onOpenChange(false);
  };

  if (offers.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Promociones Disponibles</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertDescription>
              No hay promociones disponibles para este pago en este momento.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Promoción para el cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {offers.map((offer) => {
            const calculation = calculatePaymentWithPromotion(paymentAmount, offer);

            return (
              <div
                key={offer.id}
                className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-all hover:border-blue-400 hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Offer Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-blue-900">
                          Promoción: {offer.title}
                        </h3>
                        {offer.discountType === "percentage" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {offer.discountValue}% Descuento
                          </Badge>
                        )}
                        {offer.discountType === "fixed" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {formatCurrency(offer.discountValue)} Descuento
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-blue-700">
                        Tipo de Promoción: {offer.discountType === "percentage" ? "Tienda" : "Banco"}
                      </p>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="rounded-md bg-white p-3">
                    <p className="text-sm text-gray-700">{offer.description}</p>

                    {/* Conditions */}
                    <div className="mt-3 space-y-1 text-xs text-gray-600">
                      {offer.minPaymentAmount && (
                        <div>
                          • Pago mínimo requerido: {formatCurrency(offer.minPaymentAmount)}
                        </div>
                      )}
                      {offer.maxDiscount && (
                        <div>
                          • Descuento máximo: {formatCurrency(offer.maxDiscount)}
                        </div>
                      )}
                      {offer.applicableCardTypes && offer.applicableCardTypes.length > 0 && (
                        <div>
                          • Aplica para: {offer.applicableCardTypes.join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Validity */}
                    <div className="mt-2 text-xs text-gray-500">
                      Válido hasta: {formatDate(offer.validUntil)}
                    </div>
                  </div>

                  {/* Payment Calculation */}
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Monto original:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(calculation.originalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Descuento:</span>
                        <span className="font-medium text-green-600">
                          - {formatCurrency(calculation.discount)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold text-gray-900">Monto final a pagar:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(calculation.finalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {onSelectOffer && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSelectOffer(offer)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Aplicar esta promoción
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
