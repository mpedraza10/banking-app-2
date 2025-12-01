"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Printer, UserCog } from "lucide-react";
import { toast } from "sonner";
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
  const [cardInfo] = useState<CardInfo | null>(() => {
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

  const handlePrintStatement = () => {
    // Create a print-specific view
    const printWindow = window.open("", "_blank");
    if (!printWindow || !cardInfo) return;

    const formatCurrencyForPrint = (amount: number) => {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount);
    };

    const formatDateForPrint = (date: Date) => {
      return new Date(date).toLocaleDateString("es-MX");
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Estado de Cuenta - ${cardInfo.customerName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #1e40af; }
            .header { border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #374151; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; padding: 5px 0; }
            .label { color: #6b7280; }
            .value { font-weight: 500; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
            @media print { body { print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ESTADO DE CUENTA</h1>
            <p style="text-align: center;">Fecha de impresión: ${new Date().toLocaleDateString("es-MX")}</p>
          </div>
          
          <div class="section">
            <div class="section-title">DATOS DEL CLIENTE</div>
            <div class="row"><span class="label">Nombre:</span><span class="value">${cardInfo.customerName}</span></div>
            <div class="row"><span class="label">No. Cliente:</span><span class="value">${cardInfo.customerId || "-"}</span></div>
            <div class="row"><span class="label">RFC:</span><span class="value">${cardInfo.customerRFC || "-"}</span></div>
            <div class="row"><span class="label">Tarjeta:</span><span class="value">**** **** **** ${cardInfo.cardNumber.slice(-4)}</span></div>
          </div>

          <div class="section">
            <div class="section-title">INFORMACIÓN DE LA CUENTA</div>
            <div class="row"><span class="label">Saldo Actual:</span><span class="value">${formatCurrencyForPrint(cardInfo.currentBalance)}</span></div>
            <div class="row"><span class="label">Pago Mínimo:</span><span class="value">${formatCurrencyForPrint(cardInfo.minimumPayment)}</span></div>
            <div class="row"><span class="label">Fecha de Corte:</span><span class="value">${formatDateForPrint(cardInfo.statementDate)}</span></div>
            <div class="row"><span class="label">Fecha Límite de Pago:</span><span class="value">${formatDateForPrint(cardInfo.dueDate)}</span></div>
            <div class="row"><span class="label">Crédito Disponible:</span><span class="value">${formatCurrencyForPrint(cardInfo.availableCredit)}</span></div>
            <div class="row"><span class="label">Límite de Crédito:</span><span class="value">${formatCurrencyForPrint(cardInfo.creditLimit)}</span></div>
          </div>

          <div class="footer">
            <p>Este documento es un comprobante de consulta de estado de cuenta.</p>
            <p>Para cualquier aclaración, acuda a su sucursal más cercana.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success("Imprimiendo estado de cuenta...");
  };

  const handleUpdateClientData = () => {
    // Navigate to customer search with pre-selected customer
    if (cardInfo?.customerId) {
      sessionStorage.setItem("preSelectedCustomerId", cardInfo.customerId);
    }
    router.push("/customers/search");
  };

  if (!cardInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Cargando información de la tarjeta...</div>
      </div>
    );
  }

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
                  <div className="text-sm text-gray-900">{cardInfo.customerState || "-"}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Número de cliente</div>
                  <div className="text-sm text-gray-900">{cardInfo.customerId || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Municipio</div>
                  <div className="text-sm text-gray-900">{cardInfo.customerCity || "-"}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Fecha de nac.</div>
                  <div className="text-sm text-gray-900">
                    {cardInfo.customerBirthDate ? formatDate(new Date(cardInfo.customerBirthDate)) : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Dirección</div>
                  <div className="text-sm text-gray-900">{cardInfo.customerAddress || "-"}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">RFC</div>
                  <div className="text-sm text-gray-900">{cardInfo.customerRFC || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Teléfono casa</div>
                  <div className="text-sm text-gray-900">{cardInfo.customerPhoneHome || "-"}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div></div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Teléfono oficina</div>
                  <div className="text-sm text-gray-900">{cardInfo.customerPhoneOffice || "-"}</div>
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
        <div className="mt-6 flex flex-wrap gap-4">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Regresar
          </Button>
          <Button
            onClick={handlePrintStatement}
            variant="outline"
            className="border-gray-600 text-gray-600 hover:bg-gray-50"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Estado de Cuenta
          </Button>
          <Button
            onClick={handleUpdateClientData}
            variant="outline"
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            <UserCog className="mr-2 h-4 w-4" />
            Actualizar Datos del Cliente
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
