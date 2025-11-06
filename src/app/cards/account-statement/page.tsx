"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { CardInfo } from "@/lib/actions/card-payments";

export default function AccountStatementPage() {
  return (
    <ProtectedRoute>
      <AccountStatementContent />
    </ProtectedRoute>
  );
}

function AccountStatementContent() {
  const router = useRouter();
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(() => {
    // Initialize state from sessionStorage
    if (typeof window !== "undefined") {
      const storedCardInfo = sessionStorage.getItem("currentCardInfo");
      if (storedCardInfo) {
        return JSON.parse(storedCardInfo) as CardInfo;
      }
    }
    return null;
  });

  useEffect(() => {
    // Redirect if no card info
    if (!cardInfo) {
      router.push("/cards/payment");
    }
  }, [cardInfo, router]);

  const handleProceedToPayment = () => {
    router.push("/cards/payment-type");
  };

  const handleBack = () => {
    sessionStorage.removeItem("currentCardInfo");
    router.push("/cards/payment");
  };

  if (!cardInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Cargando información de la tarjeta...</div>
      </div>
    );
  }

  // Mask card number (show only last 4 digits)
  const maskedCardNumber = `**** **** **** ${cardInfo.cardNumber.slice(-4)}`;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-MX");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Pago de tarjeta</h1>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            Busca la tarjeta asociada a la cuenta de tu cliente.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Datos del cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Nombre completo</div>
                  <div className="text-sm text-gray-900">{cardInfo.customerName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Estado</div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Número de cliente</div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Municipio</div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Fecha de nac.</div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Dirección</div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">RFC</div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Teléfono casa</div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div></div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Teléfono oficina</div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Statement Card */}
          <Card>
            <CardContent className="space-y-6 pt-6">
              {/* Account Status Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Estatus</div>
                    <div className="text-gray-900">Al Corriente</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Saldo línea ropa</div>
                    <div className="text-gray-900">{formatCurrency(0)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Abono pendiente</div>
                    <div className="text-gray-900">{formatCurrency(0)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div></div>
                  <div></div>
                  <div>
                    <div className="font-medium text-gray-700">Disponible de Efvo Hasta</div>
                    <div className="text-gray-900">
                      {cardInfo.creditLimit ? formatCurrency(cardInfo.availableCredit) : "-"}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Information */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Pago para comprar</div>
                    <div className="text-gray-900">{formatCurrency(0)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Saldo línea efectivo</div>
                    <div className="text-gray-900">{formatCurrency(cardInfo.availableCredit)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Pagos en línea</div>
                    <div className="text-red-600">{formatCurrency(0)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Cliente candidato a</div>
                    <div className="text-gray-900">No Aplica</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Saldo línea adicional</div>
                    <div className="text-gray-900">{formatCurrency(0)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Pagos adelantados</div>
                    <div className="text-red-600">{formatCurrency(0)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Regresar
          </Button>
          <Button
            onClick={handleProceedToPayment}
            className="bg-green-600 hover:bg-green-700"
          >
            Continuar a Pago
          </Button>
        </div>
      </div>
    </div>
  );
}
