"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { validateCardPayment, getPromotionalOffers } from "@/lib/actions/card-payments";
import type { CardInfo, PaymentType, PromotionalOffer } from "@/lib/actions/card-payments";

export default function PaymentTypePage() {
  return (
    <ProtectedRoute>
      <PaymentTypeContent />
    </ProtectedRoute>
  );
}

function PaymentTypeContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("minimum");
  const [customAmount, setCustomAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [promotions, setPromotions] = useState<PromotionalOffer[]>([]);
  const [showPromotions, setShowPromotions] = useState(false);

  useEffect(() => {
    // Retrieve card info from session storage
    const storedCardInfo = sessionStorage.getItem("currentCardInfo");
    if (storedCardInfo) {
      const info = JSON.parse(storedCardInfo);
      setCardInfo(info);
      
      // Load promotional offers
      if (user) {
        loadPromotions(info);
      }
    } else {
      // Redirect back to card search if no card info
      router.push("/cards/payment");
    }
  }, [router, user]);

  const loadPromotions = async (info: CardInfo) => {
    if (!user) return;

    try {
      const offers = await getPromotionalOffers(user, info.cardType, info.currentBalance);
      setPromotions(offers);
    } catch (error) {
      console.error("Error loading promotions:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-MX");
  };

  const getPaymentAmount = (): number => {
    if (!cardInfo) return 0;

    switch (paymentType) {
      case "minimum":
        return cardInfo.minimumPayment;
      case "total":
        return cardInfo.currentBalance;
      case "custom":
        return parseFloat(customAmount) || 0;
      default:
        return 0;
    }
  };

  const handlePaymentTypeChange = (value: string) => {
    setPaymentType(value as PaymentType);
    if (value !== "custom") {
      setCustomAmount("");
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    setCustomAmount(value);
  };

  const handleBack = () => {
    router.push("/cards/account-statement");
  };

  const handleProceedToPayment = async () => {
    if (!user || !cardInfo) {
      toast.error("Información de usuario o tarjeta no disponible");
      return;
    }

    const paymentAmount = getPaymentAmount();

    // Validate payment amount
    if (paymentAmount <= 0) {
      toast.error("El monto de pago debe ser mayor a cero");
      return;
    }

    // Validate cash received
    const cashAmount = parseFloat(cashReceived);
    if (isNaN(cashAmount) || cashAmount < paymentAmount) {
      toast.error("El efectivo recibido debe ser mayor o igual al monto de pago");
      return;
    }

    setIsLoading(true);

    try {
      // Validate payment with backend
      const validation = await validateCardPayment(
        user,
        cardInfo.cardNumber,
        paymentType,
        paymentAmount
      );

      if (!validation.valid) {
        toast.error(validation.message || "Validación de pago fallida");
        return;
      }

      // Store payment details in session storage
      const paymentDetails = {
        cardInfo,
        paymentType,
        paymentAmount,
        cashReceived: cashAmount,
        changeAmount: cashAmount - paymentAmount,
      };
      sessionStorage.setItem("currentPaymentDetails", JSON.stringify(paymentDetails));

      // Navigate to denomination tracking (cash received)
      router.push("/cards/cash-received");
    } catch (error) {
      console.error("Error validating payment:", error);
      toast.error(error instanceof Error ? error.message : "Error al validar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  if (!cardInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Cargando información de la tarjeta...</div>
      </div>
    );
  }

  const paymentAmount = getPaymentAmount();
  const cashAmount = parseFloat(cashReceived) || 0;
  const changeAmount = cashAmount > paymentAmount ? cashAmount - paymentAmount : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Realizar pago</h1>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            Revisa los datos del cliente para solicitar su pago correspondiente.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - Customer and Account Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 text-sm font-medium text-gray-700">
                  {cardInfo.customerName} - {cardInfo.cardNumber.slice(-4)} - FAMSA
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">Último corte</div>
                      <div className="text-gray-900">{formatDate(cardInfo.statementDate)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Cap. de pago total</div>
                      <div className="text-gray-900">{formatCurrency(cardInfo.currentBalance)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div></div>
                    <div>
                      <div className="font-medium text-gray-700">Último abono</div>
                      <div className="text-gray-900">{formatCurrency(cardInfo.creditLimit)}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">Pago total del mes</div>
                      <div className="text-gray-900">{formatCurrency(cardInfo.currentBalance)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Cap. de pago ocupada</div>
                      <div className="text-gray-900">{formatCurrency(0)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div></div>
                    <div>
                      <div className="font-medium text-gray-700">Fecha último abono</div>
                      <div className="text-gray-900">{formatDate(cardInfo.dueDate)}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">Fecha límite de pago</div>
                      <div className="text-gray-900">{formatDate(cardInfo.dueDate)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Saldo línea muebles</div>
                      <div className="text-gray-900">{formatCurrency(0)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div></div>
                    <div>
                      <div className="font-medium text-gray-700">Saldo actual</div>
                      <div className="text-gray-900">{formatCurrency(cardInfo.currentBalance)}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-4 gap-4 text-sm">
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
                    <div>
                      <div className="font-medium text-gray-700">Disponible de Efvo Hasta</div>
                      <div className="text-gray-900">{formatCurrency(cardInfo.availableCredit)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promotional Offers Button */}
            {promotions.length > 0 && (
              <Button
                onClick={() => setShowPromotions(!showPromotions)}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {showPromotions ? "Ocultar" : "Ver"} Promociones Disponibles ({promotions.length})
              </Button>
            )}
          </div>

          {/* Right Column - Payment Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Pago de tarjeta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Type Selection */}
              <RadioGroup value={paymentType} onValueChange={handlePaymentTypeChange}>
                <div className="space-y-4">
                  {/* Minimum Payment */}
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="minimum" id="minimum" />
                    <Label htmlFor="minimum" className="flex flex-1 cursor-pointer items-center justify-between">
                      <span className="font-medium">Pago mínimo adelantado</span>
                      <span className="text-gray-900">{formatCurrency(cardInfo.minimumPayment)}</span>
                    </Label>
                  </div>

                  {/* Advance Payment */}
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="advance" id="advance" />
                    <Label htmlFor="advance" className="flex flex-1 cursor-pointer items-center justify-between">
                      <span className="font-medium">Pago anticipado</span>
                      <Input
                        type="text"
                        placeholder="Pago anticipado"
                        disabled
                        className="ml-2 w-32"
                      />
                    </Label>
                  </div>

                  {/* Available Credit Payment */}
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex flex-1 cursor-pointer items-center justify-between">
                      <span className="font-medium">Pago línea disp. de efectivo</span>
                      <Input
                        type="text"
                        placeholder="Pago línea disp. de efectivo"
                        disabled
                        className="ml-2 w-32"
                      />
                    </Label>
                  </div>

                  {/* Total Payment */}
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="total" id="total" />
                    <Label htmlFor="total" className="flex flex-1 cursor-pointer items-center justify-between">
                      <span className="font-medium">Pago línea ropa</span>
                      <Input
                        type="text"
                        placeholder="Pago línea ropa"
                        disabled
                        className="ml-2 w-32"
                      />
                    </Label>
                  </div>

                  {/* Custom Amount */}
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="flex flex-1 cursor-pointer items-center justify-between">
                      <span className="font-medium">Otra cantidad</span>
                      <Input
                        type="text"
                        placeholder="Otra cantidad"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        disabled={paymentType !== "custom"}
                        className="ml-2 w-32"
                      />
                    </Label>
                  </div>

                  {/* With Benefit Payment */}
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="benefit" id="benefit" />
                    <Label htmlFor="benefit" className="flex flex-1 cursor-pointer items-center justify-between">
                      <span className="font-medium">Pago con Beneficio</span>
                      <Input
                        type="text"
                        placeholder="Pago con Beneficio"
                        disabled
                        className="ml-2 w-32"
                      />
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <Separator />

              {/* Cash Received */}
              <div>
                <Label htmlFor="cashReceived" className="text-sm font-medium text-gray-700">
                  Efectivo recibido
                </Label>
                <Input
                  id="cashReceived"
                  type="text"
                  placeholder="Efectivo recibido"
                  value={cashReceived}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^\d*\.?\d{0,2}$/.test(value)) return;
                    setCashReceived(value);
                  }}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Regresar
                </Button>
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isLoading || paymentAmount <= 0 || cashAmount < paymentAmount}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Procesando..." : "Pagar Tarjeta"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promotional Offers Display */}
        {showPromotions && promotions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base font-medium">Promociones Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <Alert key={promo.id} className="border-blue-200 bg-blue-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-semibold text-blue-900">{promo.title}</div>
                        <div className="text-sm text-blue-800">{promo.description}</div>
                        <div className="text-xs text-blue-700">
                          Válido hasta: {formatDate(promo.validUntil)}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
