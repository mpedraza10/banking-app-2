"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Printer, X } from "lucide-react";
import { ReceiptPrinter } from "@/components/receipts";
import type { TransactionDetail } from "@/lib/actions/transactions";
import type { ReceiptData } from "@/lib/actions/receipts";

interface TransactionConfirmationProps {
  transaction: TransactionDetail;
  receipt?: ReceiptData;
  onClose?: () => void;
  onNewTransaction?: () => void;
}

export function TransactionConfirmation({
  transaction,
  receipt,
  onClose,
  onNewTransaction,
}: TransactionConfirmationProps) {
  const [showReceipt] = useState(false);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Posted":
        return <Badge className="bg-green-500">Completada</Badge>;
      case "Draft":
        return <Badge variant="secondary">Borrador</Badge>;
      case "Pending":
        return <Badge variant="outline">Pendiente</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePrint = () => {
    if (receipt) {
      window.print();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Transacción Completada</CardTitle>
          <p className="text-muted-foreground">
            La transacción se ha procesado exitosamente
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Transaction Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Información de Transacción</h3>
              {getStatusBadge(transaction.transactionStatus)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Número de Transacción:</span>
                <p className="font-medium">{transaction.transactionNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <p className="font-medium">{transaction.transactionType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha:</span>
                <p className="font-medium">{formatDate(transaction.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Método de Pago:</span>
                <p className="font-medium">{transaction.paymentMethod}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Items */}
          {transaction.items && transaction.items.length > 0 && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Detalles</h3>
                {transaction.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {item.quantity}
                      </p>
                      {item.referenceNumber && (
                        <p className="text-xs text-muted-foreground">
                          Ref: {item.referenceNumber}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.amount * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator />
            </>
          )}

          {/* Total Amount */}
          <div className="flex justify-between items-center text-lg p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
              {formatCurrency(transaction.totalAmount)}
            </span>
          </div>

          {/* Receipt Information */}
          {receipt && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Comprobante</h3>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Folio: {receipt.receiptNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {receipt.printedAt
                        ? `Impreso: ${formatDate(receipt.printedAt)}`
                        : "Listo para imprimir"}
                    </p>
                  </div>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onNewTransaction}
              className="flex-1"
              variant="default"
              size="lg"
            >
              Nueva Transacción
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="lg">
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden receipt for printing */}
      {receipt && showReceipt && (
        <div className="hidden print:block">
          <ReceiptPrinter receipt={receipt} />
        </div>
      )}
    </div>
  );
}
