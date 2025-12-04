"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { toast } from "sonner";
import type { ServiceDTO } from "@/lib/actions/services";
import { processServicePayment } from "@/lib/actions/services";
import { CashDenominationsSection } from "./cash-denominations-section";
import { PaymentReceiptDialog } from "./payment-receipt-dialog";
import type { User } from "@supabase/supabase-js";

// Form validation schema
const servicePaymentSchema = z.object({
  serviceId: z.string().min(1, "Service type is required"),
  referenceNumber: z.string().min(1, "Reference number is required").regex(/^\d+$/, "La referencia debe contener solo números"),
  verificationDigit: z.string().optional().refine(
    (val) => !val || /^\d$/.test(val),
    "El dígito verificador debe ser exactamente 1 número (0-9)"
  ),
  dueDate: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const inputDate = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today;
    },
    "Recibo vencido - La fecha de vencimiento no puede ser anterior a la fecha actual"
  ),
  receiptOwnerName: z.string().optional(),
  customerType: z.enum(["client", "user"]),
  customerAccountNumber: z.string().optional(),
  commissionAmount: z.string().optional(),
  receiptAmount: z.string().min(1, "Receipt amount is required"),
  transactionAmount: z.string().optional(),
  cashReceived: z.string().optional(),
}).refine(
  (data) => {
    // If customer type is client, account number is required
    if (data.customerType === "client") {
      return data.customerAccountNumber && data.customerAccountNumber.trim().length > 0;
    }
    return true;
  },
  {
    message: "Número de cuenta/tarjeta es requerido para clientes",
    path: ["customerAccountNumber"],
  }
);

type ServicePaymentFormData = z.infer<typeof servicePaymentSchema>;

interface ReferenceValidationResult {
  isValid: boolean;
  service: {
    id: string;
    name: string;
    serviceCode: string;
    commissionRate: string;
    fixedCommission: string | null;
    isActive: boolean;
  } | null;
  paymentDetails: {
    amount: number;
    dueDate?: string;
  } | null;
  commission: {
    amount: number;
    rate: number;
  } | null;
  message?: string;
  requiresVerificationDigit?: boolean;
}

interface CustomerAccountValidationResult {
  isValid: boolean;
  customerId?: string;
  customerName?: string;
  accountType?: string;
  message: string;
}

interface ServicePaymentFormProps {
  services: ServiceDTO[];
  onSubmit: (data: ServicePaymentFormData) => Promise<void>;
  onValidateReference?: (serviceId: string, reference: string, verificationDigit?: string) => Promise<ReferenceValidationResult>;
  onValidateCustomerAccount?: (identifier: string) => Promise<CustomerAccountValidationResult>;
  user: User | null;
}

export function ServicePaymentForm({
  services,
  onSubmit,
  onValidateReference,
  onValidateCustomerAccount,
  user,
}: ServicePaymentFormProps) {
  const [isValidatingReference, setIsValidatingReference] = useState(false);
  const [isValidatingAccount, setIsValidatingAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [requiresVerificationDigit, setRequiresVerificationDigit] = useState(false);
  const [validatedCustomerName, setValidatedCustomerName] = useState<string | null>(null);
  const [accountValidationError, setAccountValidationError] = useState<string | null>(null);
  const [lastPaymentData, setLastPaymentData] = useState<{
    transactionNumber: string;
    serviceName: string;
    referenceNumber: string;
    amount: number;
    commission: number;
    total: number;
    date: Date;
    cashReceived?: number;
    changeAmount?: number;
  } | null>(null);
  
  // Cash denominations state
  const [bills, setBills] = useState([
    { value: 1000, quantity: 0, total: 0 },
    { value: 500, quantity: 0, total: 0 },
    { value: 200, quantity: 0, total: 0 },
    { value: 100, quantity: 0, total: 0 },
    { value: 50, quantity: 0, total: 0 },
    { value: 20, quantity: 0, total: 0 },
  ]);
  
  const [coins, setCoins] = useState([
    { value: 10, quantity: 0, total: 0 },
    { value: 5, quantity: 0, total: 0 },
    { value: 2, quantity: 0, total: 0 },
    { value: 1, quantity: 0, total: 0 },
    { value: 0.5, quantity: 0, total: 0 },
    { value: 0.2, quantity: 0, total: 0 },
    { value: 0.1, quantity: 0, total: 0 },
    { value: 0.05, quantity: 0, total: 0 },
    { value: 0.01, quantity: 0, total: 0 },
  ]);

  // Track if user manually entered cash received (vs. using denominations)
  const [manualCashReceived, setManualCashReceived] = useState<number | null>(null);

  const [commissionRate, setCommissionRate] = useState(0);
  const [fixedCommission, setFixedCommission] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ServicePaymentFormData>({
    resolver: zodResolver(servicePaymentSchema),
    defaultValues: {
      customerType: "user",
    },
  });

  const serviceId = watch("serviceId");
  const referenceNumber = watch("referenceNumber");
  const verificationDigit = watch("verificationDigit");
  const customerType = watch("customerType");
  const customerAccountNumber = watch("customerAccountNumber");
  const receiptAmount = watch("receiptAmount");
  
  // Calculate totals
  // Commission = Fixed + (Amount * Rate)
  const currentReceiptAmount = parseFloat(receiptAmount || "0") || 0;
  const calculatedCommission = fixedCommission + (currentReceiptAmount * commissionRate);
  
  const denominationsTotal = [...bills, ...coins].reduce((sum, d) => sum + d.total, 0);
  // Use manual cash entry if provided, otherwise use denominations total
  const cashTotal = manualCashReceived !== null && manualCashReceived > 0 
    ? manualCashReceived 
    : denominationsTotal;
  const transactionTotal = currentReceiptAmount + calculatedCommission;
  
  // Update commission amount field when calculated commission changes
  useEffect(() => {
    setValue("commissionAmount", calculatedCommission.toFixed(2));
  }, [calculatedCommission, setValue]);

  // Update transaction amount when receipt or commission changes
  useEffect(() => {
    setValue("transactionAmount", transactionTotal.toFixed(2));
  }, [transactionTotal, setValue]);
  
  // Update cash received when denominations change (only if not manually set)
  useEffect(() => {
    if (manualCashReceived === null && denominationsTotal > 0) {
      setValue("cashReceived", denominationsTotal.toFixed(2));
    }
  }, [denominationsTotal, setValue, manualCashReceived]);

  // Handle reference validation when both service and reference are present
  const handleValidateReference = async () => {
    if (!serviceId || !referenceNumber) {
      toast.error("Seleccione tipo de servicio e ingrese número de referencia");
      return;
    }

    setIsValidatingReference(true);
    try {
      if (onValidateReference) {
        // Include verification digit in validation
        const result = await onValidateReference(serviceId, referenceNumber, verificationDigit);
        
        // Update if service requires verification digit
        if (result.requiresVerificationDigit !== undefined) {
          setRequiresVerificationDigit(result.requiresVerificationDigit);
        }
        
        if (!result.isValid) {
          // Show toast for invalid validation (no error thrown)
          toast.error(result.message || "Referencia o dígito verificador inválido");
          setFixedCommission(0);
          setCommissionRate(0);
          setValue("commissionAmount", "0.00");
          return;
        }
        
        if (result?.commission) {
          setFixedCommission(result.commission.amount);
          setCommissionRate(result.commission.rate);
          
          // Initial calculation will happen via effect
          
          if (result.paymentDetails?.amount) {
             setValue("receiptAmount", result.paymentDetails.amount.toFixed(2));
          }
        }
        
        toast.success("Referencia validada correctamente");
      }
    } catch (error) {
      // Only catch unexpected errors, not validation failures
      toast.error(error instanceof Error ? error.message : "Error inesperado al validar");
      setFixedCommission(0);
      setCommissionRate(0);
      setValue("commissionAmount", "0.00");
    } finally {
      setIsValidatingReference(false);
    }
  };

  // Handle customer account validation
  const handleValidateCustomerAccount = async () => {
    if (!customerAccountNumber || customerAccountNumber.trim() === "") {
      setValidatedCustomerName(null);
      setAccountValidationError(null);
      return;
    }

    setIsValidatingAccount(true);
    setAccountValidationError(null);
    setValidatedCustomerName(null);

    try {
      if (onValidateCustomerAccount) {
        const result = await onValidateCustomerAccount(customerAccountNumber);
        
        if (!result.isValid) {
          setAccountValidationError(result.message);
          toast.error(result.message);
        } else {
          setValidatedCustomerName(result.customerName || null);
          toast.success(`Cliente encontrado: ${result.customerName || "Cuenta válida"}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al validar cuenta";
      setAccountValidationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidatingAccount(false);
    }
  };

  const onSubmitForm = async (data: ServicePaymentFormData) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Validate verification digit if required
      if (requiresVerificationDigit && (!data.verificationDigit || data.verificationDigit.trim() === "")) {
        toast.error("Dígito verificador es requerido para este servicio");
        setIsSubmitting(false);
        return;
      }

      // Validate customer account if client type is selected
      if (data.customerType === "client") {
        if (!data.customerAccountNumber || data.customerAccountNumber.trim() === "") {
          toast.error("Número de cuenta/tarjeta es requerido para clientes");
          setIsSubmitting(false);
          return;
        }
        
        // Check if account was validated and has error
        if (accountValidationError) {
          toast.error("Debe corregir el número de cuenta/tarjeta antes de continuar");
          setIsSubmitting(false);
          return;
        }

        // If account wasn't validated yet, validate now
        if (!validatedCustomerName && onValidateCustomerAccount) {
          const validation = await onValidateCustomerAccount(data.customerAccountNumber);
          if (!validation.isValid) {
            toast.error(validation.message);
            setAccountValidationError(validation.message);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Get the effective cash received (manual entry or denominations)
      // Priority: 1) manualCashReceived state, 2) denominationsTotal, 3) form field value
      const cashReceivedValue = parseFloat(data.cashReceived || "0");
      const effectiveCashReceived = 
        manualCashReceived !== null && manualCashReceived > 0
          ? manualCashReceived
          : denominationsTotal > 0
            ? denominationsTotal
            : cashReceivedValue;

      // Validate that at least some cash is entered (manual or denominations)
      // Check this FIRST before comparing amounts
      if (effectiveCashReceived <= 0) {
        toast.error("Debe ingresar el efectivo recibido");
        setIsSubmitting(false);
        return;
      }

      // V3: Validate cash received vs transaction amount
      // Transaction amount cannot be greater than cash received
      if (transactionTotal > effectiveCashReceived) {
        toast.error("El monto de transacción no puede ser mayor al efectivo recibido");
        setIsSubmitting(false);
        return;
      }

      // V4: Validate that denomination total matches cash received field
      // Case 1: If denominations are entered and manual cash was also entered, they must match
      if (denominationsTotal > 0 && manualCashReceived !== null && manualCashReceived > 0) {
        if (Math.abs(denominationsTotal - manualCashReceived) > 0.01) {
          toast.error("Total entrada de denominaciones no coincide con el efectivo recibido");
          setIsSubmitting(false);
          return;
        }
      }
      // Case 2: If denominations are entered without manual cash, check against form field value
      if (denominationsTotal > 0 && manualCashReceived === null) {
        if (Math.abs(denominationsTotal - cashReceivedValue) > 0.01 && cashReceivedValue > 0) {
          toast.error("Total entrada de denominaciones no coincide");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare cash denominations from bills and coins
      const cashDenominations = [
        ...bills
          .filter((bill) => bill.quantity > 0)
          .map((bill) => ({
            denomination: bill.value,
            quantity: bill.quantity,
            amount: bill.total,
          })),
        ...coins
          .filter((coin) => coin.quantity > 0)
          .map((coin) => ({
            denomination: coin.value,
            quantity: coin.quantity,
            amount: coin.total,
          })),
      ];

      // Prepare payment data
      const paymentAmount = parseFloat(data.receiptAmount || "0");
      
      if (paymentAmount <= 0) {
        toast.error("El importe del recibo debe ser mayor a cero");
        setIsSubmitting(false);
        return;
      }

      // Process service payment
      // Note: processServicePayment will handle getting/creating system user internally
      const result = await processServicePayment(user, {
        serviceId: data.serviceId,
        referenceNumber: data.referenceNumber,
        verificationDigit: data.verificationDigit || undefined,
        paymentAmount,
        customerId: data.customerType === "client" && data.customerAccountNumber 
          ? data.customerAccountNumber 
          : undefined,
        userId: user.id, // Will be mapped to systemUsers.id in processServicePayment
        branchId: "BRANCH-001", // Will be overridden by system user's branchId if not provided
        cashDenominations,
      });

      // Call the original onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(data);
      }

      toast.success("Service payment processed successfully");
      
      // Show receipt - use server-calculated change amount for accuracy
      setLastPaymentData({
        transactionNumber: result.transactionNumber,
        serviceName: services.find(s => s.id === data.serviceId)?.name || "Unknown Service",
        referenceNumber: data.referenceNumber,
        amount: paymentAmount,
        commission: result.commissionAmount,
        total: paymentAmount + result.commissionAmount,
        date: new Date(),
        cashReceived: result.cashReceived ?? cashTotal,
        changeAmount: result.changeAmount ?? 0,
      });
      setShowReceipt(true);
      
      // Reset form after successful submission
      setBills((prev) => prev.map((b) => ({ ...b, quantity: 0, total: 0 })));
      setCoins((prev) => prev.map((c) => ({ ...c, quantity: 0, total: 0 })));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process payment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Service Information */}
        <div className="col-span-3 space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-700 mb-4">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Captura la información</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceId" className="text-gray-700 font-medium">
                    Tipo de Servicio:
                  </Label>
                  <Select
                    value={watch("serviceId")}
                    onValueChange={(value) => setValue("serviceId", value)}
                  >
                    <SelectTrigger id="serviceId" className="mt-1">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.serviceId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="referenceNumber" className="text-gray-700 font-medium">
                    Referencia:
                  </Label>
                  <Input
                    id="referenceNumber"
                    {...register("referenceNumber")}
                    className="mt-1"
                    placeholder="Ingrese referencia"
                    type="number"
                    onBlur={handleValidateReference}
                    disabled={isValidatingReference}
                  />
                  {isValidatingReference && (
                    <p className="text-blue-500 text-sm mt-1">
                      Validando referencia...
                    </p>
                  )}
                  {errors.referenceNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.referenceNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="verificationDigit"
                    className="text-gray-700 font-medium"
                  >
                    Dígito Verificador:
                    {requiresVerificationDigit && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id="verificationDigit"
                    {...register("verificationDigit")}
                    className={`mt-1 ${requiresVerificationDigit && !verificationDigit ? "border-orange-400" : ""}`}
                    placeholder={requiresVerificationDigit ? "0-9" : "Dígito"}
                    type="text"
                    maxLength={1}
                    pattern="[0-9]"
                    onBlur={handleValidateReference}
                  />
                  {requiresVerificationDigit && !verificationDigit && (
                    <p className="text-orange-500 text-sm mt-1">
                      Este servicio requiere dígito verificador
                    </p>
                  )}
                  {errors.verificationDigit && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.verificationDigit.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dueDate" className="text-gray-700 font-medium">
                    Fecha de Vencimiento:
                  </Label>
                  <Input
                    id="dueDate"
                    {...register("dueDate")}
                    type="date"
                    className="mt-1"
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="receiptOwnerName"
                    className="text-gray-700 font-medium"
                  >
                    Nombre titular del recibo:
                  </Label>
                  <Input
                    id="receiptOwnerName"
                    {...register("receiptOwnerName")}
                    className="mt-1"
                    placeholder="Owner name"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="customerTypeClient"
                      checked={customerType === "client"}
                      onChange={(e) => {
                        setValue("customerType", e.target.checked ? "client" : "user");
                        if (!e.target.checked) {
                          // Reset validation state when switching to user
                          setValidatedCustomerName(null);
                          setAccountValidationError(null);
                          setValue("customerAccountNumber", "");
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="customerTypeClient" className="text-gray-700">
                      Cliente
                    </Label>
                    <span className="text-gray-600 text-sm">
                      Número de Cuenta / Tarjeta:
                    </span>
                  </div>
                  {customerType === "client" && (
                    <>
                      <div className="relative">
                        <Input
                          {...register("customerAccountNumber")}
                          placeholder="Número de cuenta o tarjeta"
                          type="text"
                          onBlur={handleValidateCustomerAccount}
                          disabled={isValidatingAccount}
                          className={`${accountValidationError ? "border-red-500" : validatedCustomerName ? "border-green-500" : ""}`}
                        />
                        {isValidatingAccount && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          </div>
                        )}
                      </div>
                      {isValidatingAccount && (
                        <p className="text-blue-500 text-sm">
                          Validando cuenta...
                        </p>
                      )}
                      {validatedCustomerName && (
                        <p className="text-green-600 text-sm">
                          ✓ Cliente: {validatedCustomerName}
                        </p>
                      )}
                      {accountValidationError && (
                        <p className="text-red-500 text-sm">
                          ✗ {accountValidationError}
                        </p>
                      )}
                      {errors.customerAccountNumber && (
                        <p className="text-red-500 text-sm">
                          {errors.customerAccountNumber.message}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="customerTypeUser"
                    checked={customerType === "user"}
                    onChange={(e) =>
                      setValue("customerType", e.target.checked ? "user" : "client")
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="customerTypeUser" className="text-gray-700">
                    Usuario
                  </Label>
                </div>

                <div>
                  <Label
                    htmlFor="commissionAmount"
                    className="text-gray-700 font-medium"
                  >
                    Monto Comisión:
                  </Label>
                  <Input
                    id="commissionAmount"
                    {...register("commissionAmount")}
                    className="mt-1"
                    placeholder="0.00"
                    readOnly={true}
                  />
                  {(fixedCommission > 0 || commissionRate > 0) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {fixedCommission > 0 && `Fijo: $${fixedCommission.toFixed(2)}`}
                      {fixedCommission > 0 && commissionRate > 0 && " + "}
                      {commissionRate > 0 && `${(commissionRate * 100).toFixed(2)}% del importe`}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="receiptAmount" className="text-gray-700 font-medium">
                    Importe del Recibo:
                  </Label>
                  <Input
                    id="receiptAmount"
                    {...register("receiptAmount")}
                    className="mt-1"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                  {errors.receiptAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.receiptAmount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="transactionAmount"
                    className="text-gray-700 font-medium"
                  >
                    Monto de Transacción:
                  </Label>
                  <Input
                    id="transactionAmount"
                    {...register("transactionAmount")}
                    className="mt-1"
                    placeholder="0.00"
                    readOnly
                  />
                </div>

                <div>
                  <Label htmlFor="cashReceived" className="text-gray-700 font-medium">
                    Efectivo Recibido:
                  </Label>
                  <Input
                    id="cashReceived"
                    className="mt-1"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={watch("cashReceived") || ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Update react-hook-form value
                      setValue("cashReceived", inputValue);
                      
                      // Update manual cash received state
                      const numericValue = parseFloat(inputValue);
                      if (!Number.isNaN(numericValue) && numericValue > 0) {
                        setManualCashReceived(numericValue);
                      } else if (inputValue === "" || inputValue === "0") {
                        setManualCashReceived(null);
                      }
                    }}
                  />
                  {manualCashReceived !== null && denominationsTotal === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Entrada manual: ${manualCashReceived.toFixed(2)}
                    </p>
                  )}
                  {/* Warning when denominations don't match manual cash received */}
                  {manualCashReceived !== null && manualCashReceived > 0 && denominationsTotal > 0 && Math.abs(denominationsTotal - manualCashReceived) > 0.01 && (
                    <p className="text-red-500 text-sm mt-1 font-medium">
                      ⚠️ Total entrada de denominaciones no coincide (${denominationsTotal.toFixed(2)} vs ${manualCashReceived.toFixed(2)})
                    </p>
                  )}
                </div>

                {/* Show change calculation when manual cash is entered */}
                {manualCashReceived !== null && manualCashReceived > transactionTotal && (
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-medium text-sm">
                        Cambio a entregar:
                      </span>
                      <span className="text-orange-700 font-bold">
                        ${(manualCashReceived - transactionTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}



              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cash Denominations */}
        <div className="col-span-9">
          <CashDenominationsSection
            bills={bills}
            coins={coins}
            onBillQuantityChange={(value, quantity) => {
              setBills((prev) =>
                prev.map((bill) =>
                  bill.value === value
                    ? { ...bill, quantity, total: value * quantity }
                    : bill
                )
              );
            }}
            onCoinQuantityChange={(value, quantity) => {
              setCoins((prev) =>
                prev.map((coin) =>
                  coin.value === value
                    ? { ...coin, quantity, total: value * quantity }
                    : coin
                )
              );
            }}
            transactionTotal={transactionTotal}
            cashTotal={cashTotal}
            onReset={() => {
              setBills((prev) => prev.map((b) => ({ ...b, quantity: 0, total: 0 })));
              setCoins((prev) => prev.map((c) => ({ ...c, quantity: 0, total: 0 })));
            }}
            onAccept={handleSubmit(onSubmitForm)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <PaymentReceiptDialog
        open={showReceipt}
        onOpenChange={(open) => {
          setShowReceipt(open);
          if (!open) {
            // Reset form and state
            reset({
              serviceId: "",
              referenceNumber: "",
              verificationDigit: "",
              dueDate: "",
              receiptAmount: "",
              transactionAmount: "",
              cashReceived: "",
              commissionAmount: "",
              customerType: "user",
              customerAccountNumber: "",
              receiptOwnerName: "",
            });
            
            // Reset local state
            setCommissionRate(0);
            setFixedCommission(0);
            setLastPaymentData(null);
            setRequiresVerificationDigit(false);
            setValidatedCustomerName(null);
            setAccountValidationError(null);
            setManualCashReceived(null);
            
            // Reset cash denominations
            setBills(bills.map(b => ({ ...b, quantity: 0, total: 0 })));
            setCoins(coins.map(c => ({ ...c, quantity: 0, total: 0 })));
          }
        }}
        paymentData={lastPaymentData}
      />
    </form>
  );
}
