"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ReceiptData } from "@/lib/actions/receipts";

interface ReceiptTemplateProps {
  receipt: ReceiptData;
  onPrint?: () => void;
  onReprint?: () => void;
  isReprint?: boolean;
}

export function ReceiptTemplate({
  receipt,
  onPrint,
  onReprint,
  isReprint = false,
}: ReceiptTemplateProps) {
  const formatCurrency = (amount: number) => {
    return `$${amount ? amount.toFixed(2) : "0.00"}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto print:shadow-none">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="text-2xl font-bold text-blue-600">
            Caja Cooperativa
          </div>
        </div>
        <CardTitle className="text-xl">Comprobante de Transacción</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Receipt Header Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">Folio:</span>
            <span>{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Transacción:</span>
            <span>{receipt.transactionNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Fecha:</span>
            <span>{formatDate(receipt.transactionDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Tipo:</span>
            <span>{receipt.transactionType}</span>
          </div>
        </div>

        <Separator />

        {/* Customer Information (if available) */}
        {receipt.customerInfo && (
          <>
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold text-base">Información del Cliente</h3>
              {receipt.customerInfo.name && (
                <div className="flex justify-between">
                  <span className="font-semibold">Nombre:</span>
                  <span>{receipt.customerInfo.name}</span>
                </div>
              )}
              {receipt.customerInfo.accountNumber && (
                <div className="flex justify-between">
                  <span className="font-semibold">Cuenta:</span>
                  <span>{receipt.customerInfo.accountNumber}</span>
                </div>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Transaction Items */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Detalles</h3>
          {receipt.items.map((item, index) => (
            <div key={index} className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{item.description}</span>
                <span>{formatCurrency(item.amount * item.quantity)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Cantidad: {item.quantity}</span>
                <span>Precio unitario: {formatCurrency(item.amount)}</span>
              </div>
              {item.referenceNumber && (
                <div className="text-xs text-muted-foreground">
                  Ref: {item.referenceNumber}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Payment Summary */}
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold text-base">Resumen de Pago</h3>
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">
              {formatCurrency(receipt.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Método de Pago:</span>
            <span>{receipt.paymentMethod}</span>
          </div>

          {receipt.cashReceived && (
            <div className="flex justify-between">
              <span className="font-semibold">Efectivo Recibido:</span>
              <span>{formatCurrency(receipt.cashReceived)}</span>
            </div>
          )}

          {receipt.changeGiven && receipt.changeGiven > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold">Cambio:</span>
              <span>{formatCurrency(receipt.changeGiven)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Gracias por su preferencia</p>
          <p>Conserve este comprobante para cualquier aclaración</p>
          {isReprint && receipt.reprintCount > 0 && (
            <p className="font-semibold text-orange-600 mt-2">
              REIMPRESIÓN #{receipt.reprintCount}
            </p>
          )}
        </div>

        {/* Action Buttons (not printed) */}
        <div className="flex gap-2 justify-end print:hidden mt-6">
          {onPrint && (
            <Button onClick={onPrint} variant="default">
              Imprimir
            </Button>
          )}
          {onReprint && (
            <Button onClick={onReprint} variant="outline">
              Reimprimir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
