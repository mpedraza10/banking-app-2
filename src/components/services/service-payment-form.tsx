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
import type { User } from "@supabase/supabase-js";

// Form validation schema
const servicePaymentSchema = z.object({
  serviceId: z.string().min(1, "Service type is required"),
  referenceNumber: z.string().min(1, "Reference number is required").regex(/^\d+$/, "La referencia debe contener solo números"),
  verificationDigit: z.string().optional(),
  dueDate: z.string().optional(),
  receiptOwnerName: z.string().optional(),
  customerType: z.enum(["client", "user"]),
  customerAccountNumber: z.string().optional(),
  commissionAmount: z.string().optional(),
  receiptAmount: z.string().min(1, "Receipt amount is required"),
  transactionAmount: z.string().optional(),
  cashReceived: z.string().optional(),
});

type ServicePaymentFormData = z.infer<typeof servicePaymentSchema>;

interface ServicePaymentFormProps {
  services: ServiceDTO[];
  onSubmit: (data: ServicePaymentFormData) => Promise<void>;
  onValidateReference?: (serviceId: string, reference: string) => Promise<void>;
  user: User | null;
}

export function ServicePaymentForm({
  services,
  onSubmit,
  onValidateReference,
  user,
}: ServicePaymentFormProps) {
  const [isValidatingReference, setIsValidatingReference] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServicePaymentFormData>({
    resolver: zodResolver(servicePaymentSchema),
    defaultValues: {
      customerType: "user",
    },
  });

  const serviceId = watch("serviceId");
  const referenceNumber = watch("referenceNumber");
  const customerType = watch("customerType");
  const receiptAmount = watch("receiptAmount");
  const commissionAmount = watch("commissionAmount");
  
  // Calculate totals
  const cashTotal = [...bills, ...coins].reduce((sum, d) => sum + d.total, 0);
  const transactionTotal = (parseFloat(receiptAmount || "0") || 0) + (parseFloat(commissionAmount || "0") || 0);
  
  // Update transaction amount when receipt or commission changes
  useEffect(() => {
    setValue("transactionAmount", transactionTotal.toFixed(2));
  }, [transactionTotal, setValue]);
  
  // Update cash received when denominations change
  useEffect(() => {
    setValue("cashReceived", cashTotal.toFixed(2));
  }, [cashTotal, setValue]);

  // Handle reference validation when both service and reference are present
  const handleValidateReference = async () => {
    if (!serviceId || !referenceNumber) {
      toast.error("Please select service type and enter reference number");
      return;
    }

    setIsValidatingReference(true);
    try {
      if (onValidateReference) {
        await onValidateReference(serviceId, referenceNumber);
        toast.success("Reference validated successfully");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Validation failed");
    } finally {
      setIsValidatingReference(false);
    }
  };

  const onSubmitForm = async (data: ServicePaymentFormData) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
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

      // Process service payment
      // Note: processServicePayment will handle getting/creating system user internally
      await processServicePayment(user, {
        serviceId: data.serviceId,
        referenceNumber: data.referenceNumber,
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
                    placeholder="Enter reference"
                    type="number"
                    onBlur={handleValidateReference}
                  />
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
                  </Label>
                  <Input
                    id="verificationDigit"
                    {...register("verificationDigit")}
                    className="mt-1"
                    placeholder="Verification digit"
                  />
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
                      onChange={(e) =>
                        setValue("customerType", e.target.checked ? "client" : "user")
                      }
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
                    <Input
                      {...register("customerAccountNumber")}
                      placeholder="Account/Card number"
                    />
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
                    {...register("cashReceived")}
                    className="mt-1"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
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
          />
        </div>
      </div>
    </form>
  );
}
