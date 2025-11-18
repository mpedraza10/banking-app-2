"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Printer } from "lucide-react";
import { toast } from "sonner";
import { processCardPayment } from "@/lib/actions/card-payments";
import type { CardInfo, PaymentType } from "@/lib/actions/card-payments";

interface PaymentDetails {
  cardInfo: CardInfo;
  paymentType: PaymentType;
  paymentAmount: number;
  cashReceived: number;
  changeAmount: number;
}

interface PaymentResult {
  paymentId: string;
  transactionId: string;
  previousBalance: number;
  paymentAmount: number;
  newBalance: number;
  availableCredit: number;
  paymentType: string;
  message: string;
}

export default function PaymentConfirmationPage() {
  return (
    <ProtectedRoute>
      <PaymentConfirmationContent />
    </ProtectedRoute>
  );
}

function PaymentConfirmationContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async (details: PaymentDetails) => {
    if (!user) {
      setError("Usuario no autenticado");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate denomination details (should come from previous screen)
      const denominationDetails = {
        "1000": 1,
        "500": 2,
        "200": 1,
      };

      // Process payment
      const result = await processCardPayment(
        user,
        {
          cardId: details.cardInfo.cardNumber,
          paymentType: details.paymentType,
          paymentAmount: details.paymentAmount,
          userId: user.id,
          branchId: "BRANCH-001", // TODO: Get from user session/context
        },
        denominationDetails
      );

      setPaymentResult(result);
      setProcessingComplete(true);
      toast.success("Pago procesado exitosamente");

      // Store result for receipt generation
      sessionStorage.setItem("lastPaymentResult", JSON.stringify(result));
    } catch (err) {
      console.error("Payment processing error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al procesar el pago";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  useEffect(() => {
    // Retrieve payment details from session storage
    const storedDetails = sessionStorage.getItem("currentPaymentDetails");
    if (storedDetails) {
      const details = JSON.parse(storedDetails);
      setPaymentDetails(details);
      
      // Automatically process payment when component loads
      processPayment(details);
    } else {
      // Redirect back to card search if no payment details
      router.push("/cards/payment");
    }
  }, [router, processPayment]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const handlePrintReceipt = () => {
    // TODO: Implement receipt printing
    toast.info("Funcionalidad de impresión en desarrollo");
  };

  const handleNewTransaction = () => {
    // Clear session storage
    sessionStorage.removeItem("currentCardInfo");
    sessionStorage.removeItem("currentPaymentDetails");
    sessionStorage.removeItem("lastPaymentResult");
    
    // Navigate to card search
    router.push("/cards/payment");
  };

  const handleBackToDashboard = () => {
    // Clear session storage
    sessionStorage.removeItem("currentCardInfo");
    sessionStorage.removeItem("currentPaymentDetails");
    sessionStorage.removeItem("lastPaymentResult");
    
    // Navigate to dashboard
    router.push("/");
  };

  if (!paymentDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Cargando detalles del pago...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {isProcessing
              ? "Procesando Pago..."
              : processingComplete
              ? "Pago Completado"
              : "Confirmación de Pago"}
          </h1>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="flex items-center gap-3 text-blue-800">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span>Procesando pago con el sistema bancario...</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Status */}
        {processingComplete && !error && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="flex items-center gap-3 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span>Pago procesado exitosamente</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Status */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center gap-3">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base font-medium">Resumen de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Information */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 text-sm font-semibold text-gray-700">
                Información del Cliente
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.cardInfo.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarjeta:</span>
                  <span className="font-medium text-gray-900">
                    **** **** **** {paymentDetails.cardInfo.cardNumber.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de tarjeta:</span>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.cardInfo.cardType}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 text-sm font-semibold text-gray-700">
                Detalles del Pago
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de pago:</span>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.paymentType === "minimum"
                      ? "Pago mínimo"
                      : paymentDetails.paymentType === "total"
                      ? "Pago total"
                      : "Pago personalizado"}
                  </span>
                </div>
                {paymentResult && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo anterior:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(paymentResult.previousBalance)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto de pago:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(paymentDetails.paymentAmount)}
                  </span>
                </div>
                {paymentResult && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-gray-700">Nuevo saldo:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(paymentResult.newBalance)}
                    </span>
                  </div>
                )}
                {paymentResult && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crédito disponible:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(paymentResult.availableCredit)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cash Details */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 text-sm font-semibold text-gray-700">
                Detalles de Efectivo
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Efectivo recibido:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(paymentDetails.cashReceived)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cambio entregado:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(paymentDetails.changeAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Information */}
            {paymentResult && (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 text-sm font-semibold text-blue-900">
                  Información de Transacción
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">ID de pago:</span>
                    <span className="font-mono text-xs text-blue-900">
                      {paymentResult.paymentId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">ID de transacción:</span>
                    <span className="font-mono text-xs text-blue-900">
                      {paymentResult.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Fecha y hora:</span>
                    <span className="text-blue-900">
                      {new Date().toLocaleString("es-MX")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handlePrintReceipt}
            disabled={!processingComplete || !!error}
            variant="outline"
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir Recibo
          </Button>
          <Button
            onClick={handleNewTransaction}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Nueva Transacción
          </Button>
          <Button
            onClick={handleBackToDashboard}
            disabled={isProcessing}
            variant="outline"
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
