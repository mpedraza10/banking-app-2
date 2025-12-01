"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Banknote, Coins, AlertTriangle, Printer, RotateCcw, CheckCircle } from "lucide-react";
import { validateCardPayment, getPromotionalOffers } from "@/lib/actions/card-payments";
import type { CardInfo, PaymentType, PromotionalOffer } from "@/lib/actions/card-payments";

// Denomination interface
interface Denomination {
  value: number;
  quantity: number;
  total: number;
}

// Payment result interface
interface PaymentResult {
  paymentId: string;
  transactionId: string;
  transactionNumber: string;
  previousBalance: number;
  paymentAmount: number;
  newBalance: number;
  availableCredit: number;
  paymentType: PaymentType;
  cashReceived: number;
  changeAmount: number;
  timestamp: Date;
}

// Flow step type
type FlowStep = "payment-type" | "cash-received" | "denominations-in" | "promotions" | "denominations-out" | "confirmation";

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
  const [isLoading, setIsLoading] = useState(false);
  const [promotions, setPromotions] = useState<PromotionalOffer[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep>("payment-type");
  
  // Step 9: Cash received input (before denomination entry)
  const [cashReceivedInput, setCashReceivedInput] = useState("");
  
  // Payment result for confirmation/receipt
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // Denomination state for bills (cash IN)
  const [bills, setBills] = useState<Denomination[]>([
    { value: 1000, quantity: 0, total: 0 },
    { value: 500, quantity: 0, total: 0 },
    { value: 200, quantity: 0, total: 0 },
    { value: 100, quantity: 0, total: 0 },
    { value: 50, quantity: 0, total: 0 },
    { value: 20, quantity: 0, total: 0 },
  ]);

  // Denomination state for coins (cash IN)
  const [coins, setCoins] = useState<Denomination[]>([
    { value: 10, quantity: 0, total: 0 },
    { value: 5, quantity: 0, total: 0 },
    { value: 2, quantity: 0, total: 0 },
    { value: 1, quantity: 0, total: 0 },
    { value: 0.5, quantity: 0, total: 0 },
  ]);

  // V4: Change denomination output state (cash OUT)
  const [changeBills, setChangeBills] = useState<Denomination[]>([
    { value: 1000, quantity: 0, total: 0 },
    { value: 500, quantity: 0, total: 0 },
    { value: 200, quantity: 0, total: 0 },
    { value: 100, quantity: 0, total: 0 },
    { value: 50, quantity: 0, total: 0 },
    { value: 20, quantity: 0, total: 0 },
  ]);

  const [changeCoins, setChangeCoins] = useState<Denomination[]>([
    { value: 10, quantity: 0, total: 0 },
    { value: 5, quantity: 0, total: 0 },
    { value: 2, quantity: 0, total: 0 },
    { value: 1, quantity: 0, total: 0 },
    { value: 0.5, quantity: 0, total: 0 },
  ]);

  const loadPromotions = useCallback(async (info: CardInfo) => {
    if (!user) return;

    try {
      const offers = await getPromotionalOffers(user, info.cardType, info.currentBalance);
      setPromotions(offers);
    } catch (error) {
      console.error("Error loading promotions:", error);
    }
  }, [user]);

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
  }, [router, user, loadPromotions]);

  // Calculate cash received from input
  const cashReceived = parseFloat(cashReceivedInput) || 0;

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

  // Calculate total cash from denominations (cash IN)
  const denominationTotal = [...bills, ...coins].reduce((sum, d) => sum + d.total, 0);
  const paymentAmount = getPaymentAmount();
  const changeAmount = cashReceived > paymentAmount ? cashReceived - paymentAmount : 0;
  
  // Calculate change denomination total (cash OUT)
  const changeDenominationTotal = [...changeBills, ...changeCoins].reduce((sum, d) => sum + d.total, 0);

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

  const handleBillQuantityChange = (value: number, quantity: number) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.value === value
          ? { ...bill, quantity, total: value * quantity }
          : bill
      )
    );
  };

  const handleCoinQuantityChange = (value: number, quantity: number) => {
    setCoins((prev) =>
      prev.map((coin) =>
        coin.value === value
          ? { ...coin, quantity, total: value * quantity }
          : coin
      )
    );
  };

  const resetDenominations = () => {
    setBills((prev) => prev.map((b) => ({ ...b, quantity: 0, total: 0 })));
    setCoins((prev) => prev.map((c) => ({ ...c, quantity: 0, total: 0 })));
  };

  const resetChangeDenominations = () => {
    setChangeBills((prev) => prev.map((b) => ({ ...b, quantity: 0, total: 0 })));
    setChangeCoins((prev) => prev.map((c) => ({ ...c, quantity: 0, total: 0 })));
  };

  // Handle change denomination quantity updates (V4)
  const handleChangeBillQuantityChange = (value: number, quantity: number) => {
    setChangeBills((prev) =>
      prev.map((bill) =>
        bill.value === value
          ? { ...bill, quantity, total: value * quantity }
          : bill
      )
    );
  };

  const handleChangeCoinQuantityChange = (value: number, quantity: number) => {
    setChangeCoins((prev) =>
      prev.map((coin) =>
        coin.value === value
          ? { ...coin, quantity, total: value * quantity }
          : coin
      )
    );
  };

  // Handle cash received input change
  const handleCashReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    setCashReceivedInput(value);
  };

  const handleBack = () => {
    switch (currentStep) {
      case "cash-received":
        setCurrentStep("payment-type");
        setCashReceivedInput("");
        break;
      case "denominations-in":
        setCurrentStep("cash-received");
        resetDenominations();
        break;
      case "promotions":
        setCurrentStep("denominations-in");
        break;
      case "denominations-out":
        setCurrentStep("promotions");
        resetChangeDenominations();
        break;
      case "confirmation":
        // Can't go back from confirmation - start new transaction
        sessionStorage.removeItem("currentCardInfo");
        router.push("/cards/payment");
        break;
      default:
        router.push("/cards/account-statement");
    }
  };

  // V2.1: Validate payment type is selected
  const handleContinueToCashReceived = () => {
    const amount = getPaymentAmount();

    // V2.1: Must select a payment type (implicitly done via default)
    if (!paymentType) {
      toast.error("Favor de seleccionar el tipo de pago a realizar");
      return;
    }

    // Validate payment amount
    if (amount <= 0) {
      toast.error("El monto de pago debe ser mayor a cero");
      return;
    }

    // V2.2: If minimum payment, check it meets the minimum
    if (paymentType === "minimum" && cardInfo && amount < cardInfo.minimumPayment) {
      toast.error("La cuenta requiere efectuar el pago mínimo facturado");
      return;
    }

    // Validate payment doesn't exceed balance
    if (cardInfo && amount > cardInfo.currentBalance) {
      toast.error(`El monto de pago no puede exceder el saldo actual (${formatCurrency(cardInfo.currentBalance)})`);
      return;
    }

    setCurrentStep("cash-received");
  };

  // V2.3 & V2.4: Validate cash received
  const handleContinueToDenominations = () => {
    const amount = getPaymentAmount();

    // V2.3: Cash received must not be zero
    if (cashReceived <= 0) {
      toast.error("Debe indicar la cantidad recibida por el cliente y esta debe ser mayor a cero");
      return;
    }

    // V2.4: Cash received must be >= payment amount (with tolerance for floating point precision)
    // Using a small tolerance (0.01) to handle floating point comparison issues
    if (cashReceived < amount - 0.01) {
      toast.error("La cantidad recibida por el cliente no cubre el pago a realizar");
      return;
    }

    setCurrentStep("denominations-in");
  };

  // V3: Validate denomination entry matches cash received
  const handleContinueToPromotions = () => {
    // V3.1: Denomination total must match cash received
    if (Math.abs(denominationTotal - cashReceived) > 0.01) {
      toast.error("Total entrada de denominaciones no coincide");
      return;
    }

    setCurrentStep("promotions");
  };

  // V4: After promotions, check if change is needed
  const handleContinueToPostOrChange = () => {
    if (changeAmount > 0) {
      // V4.1-V4.2: If there's change, go to change denomination screen
      setCurrentStep("denominations-out");
    } else {
      // V4.1.1: No change needed, proceed to payment
      handleProcessPayment();
    }
  };

  // V4.4: Validate change denomination output
  const handleValidateChangeAndPost = () => {
    // V4.4: Change denomination total must match change amount
    if (Math.abs(changeDenominationTotal - changeAmount) > 0.01) {
      toast.error("Total salida de denominaciones no coincide");
      return;
    }

    // Proceed to payment
    handleProcessPayment();
  };

  // Process the payment (Step 14: Postear)
  const handleProcessPayment = async () => {
    if (!user || !cardInfo) {
      toast.error("Información de usuario o tarjeta no disponible");
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

      // Prepare denomination details (cash IN)
      const denominationDetails: Record<string, number> = {};
      [...bills, ...coins].forEach((d) => {
        if (d.quantity > 0) {
          denominationDetails[d.value.toString()] = d.quantity;
        }
      });

      // Prepare change denomination details (cash OUT) if applicable
      const changeDenominationDetails: Record<string, number> = {};
      if (changeAmount > 0) {
        [...changeBills, ...changeCoins].forEach((d) => {
          if (d.quantity > 0) {
            changeDenominationDetails[d.value.toString()] = d.quantity;
          }
        });
      }

      // Import processCardPayment dynamically to avoid circular dependencies
      const { processCardPayment } = await import("@/lib/actions/card-payments");
      
      // Process the payment
      const result = await processCardPayment(
        user,
        {
          cardId: cardInfo.cardNumber,
          paymentType,
          paymentAmount,
          customerId: cardInfo.customerId,
          userId: user.id,
          branchId: "default-branch", // TODO: Get from user's branch
        },
        denominationDetails,
        cashReceived,
        changeAmount,
        changeDenominationDetails
      );

      // Generate transaction number for receipt
      const transactionNumber = `CP-${Date.now().toString().slice(-8)}`;

      // Store payment result for confirmation screen
      setPaymentResult({
        paymentId: result.paymentId,
        transactionId: result.transactionId,
        transactionNumber,
        previousBalance: result.previousBalance,
        paymentAmount: result.paymentAmount,
        newBalance: result.newBalance,
        availableCredit: result.availableCredit,
        paymentType: result.paymentType,
        cashReceived: cashReceived,
        changeAmount: changeAmount,
        timestamp: new Date(),
      });

      // Step 15: Print receipt automatically
      printReceipt({
        transactionNumber,
        customerName: cardInfo.customerName,
        cardNumber: cardInfo.cardNumber,
        paymentType,
        paymentAmount,
        cashReceived,
        changeAmount,
        previousBalance: result.previousBalance,
        newBalance: result.newBalance,
        timestamp: new Date(),
      });

      // Step 17: Log to audit (handled in backend)
      toast.success("Pago procesado exitosamente");
      
      // Move to confirmation screen with reprint option
      setCurrentStep("confirmation");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error instanceof Error ? error.message : "Error al procesar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 15 & A3: Print receipt function
  const printReceipt = (data: {
    transactionNumber: string;
    customerName: string;
    cardNumber: string;
    paymentType: PaymentType;
    paymentAmount: number;
    cashReceived: number;
    changeAmount: number;
    previousBalance: number;
    newBalance: number;
    timestamp: Date;
  }) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("No se pudo abrir la ventana de impresión");
      return;
    }

    const paymentTypeLabels: Record<PaymentType, string> = {
      minimum: "Pago Mínimo",
      total: "Pago Total",
      custom: "Otra Cantidad",
      advance: "Pago Adelantado",
      credit: "Pago a Crédito",
      benefit: "Pago con Beneficio",
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante de Pago - ${data.transactionNumber}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              max-width: 300px; 
              margin: 0 auto;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 1px dashed #000; 
              padding-bottom: 10px; 
              margin-bottom: 10px; 
            }
            .header h1 { font-size: 16px; margin: 0; }
            .header p { margin: 5px 0; }
            .section { margin-bottom: 15px; }
            .row { display: flex; justify-content: space-between; padding: 3px 0; }
            .label { color: #333; }
            .value { font-weight: bold; text-align: right; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .total { font-size: 14px; font-weight: bold; }
            .footer { 
              text-align: center; 
              font-size: 10px; 
              margin-top: 20px; 
              border-top: 1px dashed #000; 
              padding-top: 10px;
            }
            .change { color: #d97706; font-weight: bold; }
            @media print { 
              body { print-color-adjust: exact; } 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BANCO FAMSA</h1>
            <p>COMPROBANTE DE PAGO</p>
            <p>PAGO DE TARJETA</p>
          </div>
          
          <div class="section">
            <div class="row">
              <span class="label">Folio:</span>
              <span class="value">${data.transactionNumber}</span>
            </div>
            <div class="row">
              <span class="label">Fecha:</span>
              <span class="value">${data.timestamp.toLocaleDateString("es-MX")}</span>
            </div>
            <div class="row">
              <span class="label">Hora:</span>
              <span class="value">${data.timestamp.toLocaleTimeString("es-MX")}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="row">
              <span class="label">Cliente:</span>
              <span class="value">${data.customerName}</span>
            </div>
            <div class="row">
              <span class="label">Tarjeta:</span>
              <span class="value">**** ${data.cardNumber.slice(-4)}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="row">
              <span class="label">Tipo de Pago:</span>
              <span class="value">${paymentTypeLabels[data.paymentType]}</span>
            </div>
            <div class="row">
              <span class="label">Saldo Anterior:</span>
              <span class="value">$${data.previousBalance.toFixed(2)}</span>
            </div>
            <div class="row total">
              <span class="label">Monto Pagado:</span>
              <span class="value">$${data.paymentAmount.toFixed(2)}</span>
            </div>
            <div class="row">
              <span class="label">Nuevo Saldo:</span>
              <span class="value">$${data.newBalance.toFixed(2)}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="row">
              <span class="label">Efectivo Recibido:</span>
              <span class="value">$${data.cashReceived.toFixed(2)}</span>
            </div>
            ${data.changeAmount > 0 ? `
            <div class="row change">
              <span class="label">Cambio Entregado:</span>
              <span class="value">$${data.changeAmount.toFixed(2)}</span>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Gracias por su pago</p>
            <p>Conserve este comprobante</p>
            <p>Para cualquier aclaración, acuda a su sucursal</p>
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
  };

  // A3: Reprint receipt function
  const handleReprintReceipt = () => {
    if (!paymentResult || !cardInfo) {
      toast.error("No hay información de pago para reimprimir");
      return;
    }

    printReceipt({
      transactionNumber: paymentResult.transactionNumber,
      customerName: cardInfo.customerName,
      cardNumber: cardInfo.cardNumber,
      paymentType: paymentResult.paymentType,
      paymentAmount: paymentResult.paymentAmount,
      cashReceived: paymentResult.cashReceived,
      changeAmount: paymentResult.changeAmount,
      previousBalance: paymentResult.previousBalance,
      newBalance: paymentResult.newBalance,
      timestamp: paymentResult.timestamp,
    });

    toast.success("Reimprimiendo comprobante...");
  };

  // Start new transaction
  const handleNewTransaction = () => {
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

  // Step 9: Cash Received Input View
  if (currentStep === "cash-received") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Efectivo Recibido</h1>
          </div>

          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              Ingresa el monto de efectivo recibido del cliente para el pago de {formatCurrency(paymentAmount)}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Captura de Efectivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="cashReceived" className="text-sm font-medium text-gray-700">
                  Efectivo Recibido
                </Label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="cashReceived"
                    type="text"
                    placeholder="0.00"
                    value={cashReceivedInput}
                    onChange={handleCashReceivedChange}
                    className="pl-7 text-xl font-semibold"
                    autoFocus
                  />
                </div>
              </div>

              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto a pagar:</span>
                      <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efectivo recibido:</span>
                      <span className="font-semibold">{formatCurrency(cashReceived)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Cambio a devolver:</span>
                      <span className={`font-bold ${changeAmount > 0 ? "text-orange-600" : "text-green-600"}`}>
                        {formatCurrency(changeAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {cashReceived > 0 && cashReceived < paymentAmount - 0.01 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    La cantidad recibida por el cliente no cubre el pago a realizar
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3">
                <Button onClick={handleBack} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  Regresar
                </Button>
                <Button
                  onClick={handleContinueToDenominations}
                  disabled={cashReceived < paymentAmount - 0.01}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 12-13: Denomination Entry View (Cash IN) - V3 Validation
  if (currentStep === "denominations-in") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Entrada de Denominaciones</h1>
          </div>

          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              Ingresa el desglose de denominaciones. El total debe coincidir con el efectivo recibido: {formatCurrency(cashReceived)}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Bills */}
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <Banknote className="h-5 w-5" />
                  Billetes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {bills.map((denom) => (
                    <div key={denom.value} className="grid grid-cols-4 gap-4 items-center py-2 border-b last:border-0">
                      <div className="col-span-1 text-right">
                        <span className="text-green-700 font-semibold">${denom.value.toFixed(2)}</span>
                      </div>
                      <div className="col-span-1 text-center text-gray-600 text-sm">
                        ({denom.quantity > 0 ? denom.quantity : 0})
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="0"
                          value={denom.quantity || ""}
                          onChange={(e) => handleBillQuantityChange(denom.value, parseInt(e.target.value) || 0)}
                          className="text-center"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-1 text-right text-gray-600 text-sm">({denom.total.toFixed(2)})</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coins */}
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <Coins className="h-5 w-5" />
                  Monedas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {coins.map((denom) => (
                    <div key={denom.value} className="grid grid-cols-4 gap-4 items-center py-2 border-b last:border-0">
                      <div className="col-span-1 text-right">
                        <span className="text-green-700 font-semibold">${denom.value.toFixed(2)}</span>
                      </div>
                      <div className="col-span-1 text-center text-gray-600 text-sm">
                        ({denom.quantity > 0 ? denom.quantity : 0})
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="0"
                          value={denom.quantity || ""}
                          onChange={(e) => handleCoinQuantityChange(denom.value, parseInt(e.target.value) || 0)}
                          className="text-center"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-1 text-right text-gray-600 text-sm">({denom.total.toFixed(2)})</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="bg-green-50 border-green-200 mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Efectivo recibido:</span>
                  <span className="text-gray-900 font-semibold text-lg">{formatCurrency(cashReceived)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total denominaciones:</span>
                  <span className={`font-semibold text-lg ${Math.abs(denominationTotal - cashReceived) > 0.01 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(denominationTotal)}
                  </span>
                </div>
                {Math.abs(denominationTotal - cashReceived) > 0.01 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="font-medium">Diferencia:</span>
                    <span className="font-bold">{formatCurrency(Math.abs(denominationTotal - cashReceived))}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {Math.abs(denominationTotal - cashReceived) > 0.01 && denominationTotal > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Total entrada de denominaciones no coincide con efectivo recibido
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button onClick={handleBack} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              Regresar
            </Button>
            <Button
              onClick={handleContinueToPromotions}
              disabled={Math.abs(denominationTotal - cashReceived) > 0.01}
              className="bg-green-600 hover:bg-green-700"
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 11: Promotions View
  if (currentStep === "promotions") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Promociones del Cliente</h1>
          </div>

          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              Revisa las promociones disponibles para el cliente antes de confirmar el pago.
            </AlertDescription>
          </Alert>

          {promotions.length > 0 ? (
            <div className="space-y-4 mb-6">
              {promotions.map((promo) => (
                <Card key={promo.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-blue-900">{promo.title}</h3>
                        <p className="text-sm text-blue-800 mt-1">{promo.description}</p>
                        <p className="text-xs text-blue-700 mt-2">
                          Válido hasta: {formatDate(promo.validUntil)}
                        </p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {promo.discountType === "percentage" ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mb-6">
              <CardContent className="pt-6 text-center text-gray-600">
                No hay promociones disponibles para este cliente en este momento.
              </CardContent>
            </Card>
          )}

          {/* Payment Summary */}
          <Card className="bg-gray-50 mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto a pagar:</span>
                  <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efectivo recibido:</span>
                  <span className="font-semibold">{formatCurrency(cashReceived)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Cambio a devolver:</span>
                  <span className={`font-bold ${changeAmount > 0 ? "text-orange-600" : "text-green-600"}`}>
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button onClick={handleBack} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              Regresar
            </Button>
            <Button onClick={handleContinueToPostOrChange} className="bg-green-600 hover:bg-green-700">
              {changeAmount > 0 ? "Continuar a Salida de Efectivo" : "Postear Pago"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // V4.2-V4.4: Change Denomination Output View (Cash OUT)
  if (currentStep === "denominations-out") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Salida de Denominaciones</h1>
          </div>

          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              Ingresa el desglose de denominaciones para entregar el cambio de {formatCurrency(changeAmount)}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Change Bills */}
            <Card>
              <CardHeader className="bg-orange-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <Banknote className="h-5 w-5 text-orange-600" />
                  Billetes (Salida)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {changeBills.map((denom) => (
                    <div key={denom.value} className="grid grid-cols-4 gap-4 items-center py-2 border-b last:border-0">
                      <div className="col-span-1 text-right">
                        <span className="text-orange-700 font-semibold">${denom.value.toFixed(2)}</span>
                      </div>
                      <div className="col-span-1 text-center text-gray-600 text-sm">
                        ({denom.quantity > 0 ? denom.quantity : 0})
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="0"
                          value={denom.quantity || ""}
                          onChange={(e) => handleChangeBillQuantityChange(denom.value, parseInt(e.target.value) || 0)}
                          className="text-center border-orange-300"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-1 text-right text-gray-600 text-sm">({denom.total.toFixed(2)})</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Change Coins */}
            <Card>
              <CardHeader className="bg-orange-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <Coins className="h-5 w-5 text-orange-600" />
                  Monedas (Salida)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {changeCoins.map((denom) => (
                    <div key={denom.value} className="grid grid-cols-4 gap-4 items-center py-2 border-b last:border-0">
                      <div className="col-span-1 text-right">
                        <span className="text-orange-700 font-semibold">${denom.value.toFixed(2)}</span>
                      </div>
                      <div className="col-span-1 text-center text-gray-600 text-sm">
                        ({denom.quantity > 0 ? denom.quantity : 0})
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="0"
                          value={denom.quantity || ""}
                          onChange={(e) => handleChangeCoinQuantityChange(denom.value, parseInt(e.target.value) || 0)}
                          className="text-center border-orange-300"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-1 text-right text-gray-600 text-sm">({denom.total.toFixed(2)})</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="bg-orange-50 border-orange-200 mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Cambio a entregar:</span>
                  <span className="text-gray-900 font-semibold text-lg">{formatCurrency(changeAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total denominaciones:</span>
                  <span className={`font-semibold text-lg ${Math.abs(changeDenominationTotal - changeAmount) > 0.01 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(changeDenominationTotal)}
                  </span>
                </div>
                {Math.abs(changeDenominationTotal - changeAmount) > 0.01 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="font-medium">Diferencia:</span>
                    <span className="font-bold">{formatCurrency(Math.abs(changeDenominationTotal - changeAmount))}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {Math.abs(changeDenominationTotal - changeAmount) > 0.01 && changeDenominationTotal > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Total salida de denominaciones no coincide con el cambio a entregar
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button onClick={handleBack} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              Regresar
            </Button>
            <Button
              onClick={handleValidateChangeAndPost}
              disabled={isLoading || Math.abs(changeDenominationTotal - changeAmount) > 0.01}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Procesando..." : "Postear Pago"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 15-16 & A3: Confirmation View with Reprint Option
  if (currentStep === "confirmation" && paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-800">Pago Realizado Exitosamente</h1>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <p className="text-sm text-gray-600">Folio de Transacción</p>
                  <p className="text-xl font-bold text-blue-600">{paymentResult.transactionNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Cliente</p>
                    <p className="font-semibold">{cardInfo.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tarjeta</p>
                    <p className="font-semibold">**** {cardInfo.cardNumber.slice(-4)}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo anterior:</span>
                    <span>{formatCurrency(paymentResult.previousBalance)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-700">Monto pagado:</span>
                    <span className="text-green-600">{formatCurrency(paymentResult.paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nuevo saldo:</span>
                    <span>{formatCurrency(paymentResult.newBalance)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efectivo recibido:</span>
                    <span>{formatCurrency(paymentResult.cashReceived)}</span>
                  </div>
                  {paymentResult.changeAmount > 0 && (
                    <div className="flex justify-between font-semibold text-orange-600">
                      <span>Cambio entregado:</span>
                      <span>{formatCurrency(paymentResult.changeAmount)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="text-center text-sm text-gray-500">
                  <p>Fecha: {paymentResult.timestamp.toLocaleDateString("es-MX")}</p>
                  <p>Hora: {paymentResult.timestamp.toLocaleTimeString("es-MX")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - A3: Reprint option */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleReprintReceipt}
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Printer className="mr-2 h-4 w-4" />
              Reimprimir Comprobante
            </Button>
            <Button
              onClick={handleNewTransaction}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Nueva Transacción
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 6-7: Payment type selection view (default)
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

            {/* Promotional Offers Preview */}
            {promotions.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <span className="font-semibold">{promotions.length} promoción(es) disponible(s)</span> para este cliente.
                  Se mostrarán antes de confirmar el pago.
                </AlertDescription>
              </Alert>
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
                      <span className="font-medium">Pago mínimo</span>
                      <span className="text-gray-900">{formatCurrency(cardInfo.minimumPayment)}</span>
                    </Label>
                  </div>

                  {/* Total Balance Payment */}
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="total" id="total" />
                    <Label htmlFor="total" className="flex flex-1 cursor-pointer items-center justify-between">
                      <span className="font-medium">Pago total (saldar cuenta)</span>
                      <span className="text-gray-900">{formatCurrency(cardInfo.currentBalance)}</span>
                    </Label>
                  </div>

                  {/* Custom Amount */}
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="flex flex-1 cursor-pointer items-center justify-between">
                      <span className="font-medium">Otra cantidad</span>
                      <Input
                        type="text"
                        placeholder="Ingrese monto"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        disabled={paymentType !== "custom"}
                        className="ml-2 w-32"
                      />
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {/* Custom amount validation error */}
              {paymentType === "custom" && parseFloat(customAmount) > cardInfo.currentBalance && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    El monto no puede exceder el saldo actual ({formatCurrency(cardInfo.currentBalance)})
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Monto a pagar:</span>
                  <span className="text-gray-900 font-bold text-xl">
                    {formatCurrency(paymentAmount)}
                  </span>
                </div>
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
                  onClick={handleContinueToCashReceived}
                  disabled={paymentAmount <= 0 || (paymentType === "custom" && parseFloat(customAmount) > cardInfo.currentBalance)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Pagar Tarjeta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
