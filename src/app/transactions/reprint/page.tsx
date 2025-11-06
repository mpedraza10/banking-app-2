"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Printer, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getReceiptByNumber, reprintReceipt, type ReceiptData } from "@/lib/actions/receipts";
import { ReceiptPrinter } from "@/components/receipts";

export default function ReceiptReprintPage() {
  const { user } = useAuth();
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!user || !receiptNumber.trim()) {
      setError("Por favor ingrese un número de folio");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const foundReceipt = await getReceiptByNumber(user, receiptNumber.trim());

      if (!foundReceipt) {
        setError("No se encontró el comprobante con ese número de folio");
        setReceipt(null);
        return;
      }

      setReceipt(foundReceipt);
    } catch (err) {
      console.error("Error searching receipt:", err);
      setError(
        err instanceof Error ? err.message : "Error al buscar el comprobante"
      );
      setReceipt(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = async () => {
    if (!user || !receipt) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Increment reprint count in database
      const updatedReceipt = await reprintReceipt(user, receipt.id);
      setReceipt(updatedReceipt);

      // Trigger print dialog
      window.print();

      setSuccess(
        `Comprobante reimpreso exitosamente (Reimpresión #${updatedReceipt.reprintCount})`
      );
    } catch (err) {
      console.error("Error reprinting receipt:", err);
      setError(
        err instanceof Error ? err.message : "Error al reimprimir el comprobante"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
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
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reimpresión de Comprobantes</CardTitle>
          <p className="text-muted-foreground">
            Busque y reimprima comprobantes de transacciones anteriores
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Número de Folio</Label>
              <div className="flex gap-2">
                <Input
                  id="receiptNumber"
                  type="text"
                  placeholder="RCP-20240101-000001"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  disabled={loading}
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading || !receiptNumber.trim()}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Receipt Details */}
          {receipt && (
            <>
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Detalles del Comprobante</h3>
                  <Badge variant="outline">
                    Impresiones: {receipt.reprintCount + 1}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Folio:</span>
                    <p className="font-medium">{receipt.receiptNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transacción:</span>
                    <p className="font-medium">{receipt.transactionNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha:</span>
                    <p className="font-medium">{formatDate(receipt.transactionDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">{receipt.transactionType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <p className="font-bold text-lg">
                      {formatCurrency(receipt.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Método de Pago:</span>
                    <p className="font-medium">{receipt.paymentMethod}</p>
                  </div>
                </div>

                {receipt.customerInfo && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold">Información del Cliente</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {receipt.customerInfo.name && (
                          <div>
                            <span className="text-muted-foreground">Nombre:</span>
                            <p className="font-medium">{receipt.customerInfo.name}</p>
                          </div>
                        )}
                        {receipt.customerInfo.accountNumber && (
                          <div>
                            <span className="text-muted-foreground">Cuenta:</span>
                            <p className="font-medium">
                              {receipt.customerInfo.accountNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Conceptos</h4>
                  {receipt.items.map((item, index) => (
                    <div
                      key={index}
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

                {/* Reprint Warning */}
                {receipt.reprintCount > 0 && (
                  <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <AlertDescription className="text-orange-700 dark:text-orange-400">
                      Este comprobante ya ha sido reimpreso {receipt.reprintCount}{" "}
                      {receipt.reprintCount === 1 ? "vez" : "veces"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Reprint Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleReprint}
                    disabled={loading}
                    size="lg"
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Reimprimir Comprobante
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Hidden receipt for printing */}
      {receipt && (
        <div className="hidden print:block">
          <ReceiptPrinter receipt={receipt} isReprint={true} />
        </div>
      )}
    </div>
  );
}
