"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/hooks/useAuth";
import { getCustomerById, updateCustomer } from "@/lib/actions/customers";
import type { CustomerUpdateData } from "@/lib/actions/customers";
import { toast } from "sonner";
import { CardSelectionTable } from "./card-selection-table";

interface CustomerDetailDisplayProps {
  customerId: string;
  onBack: () => void;
}

interface CustomerDetails {
  id: string;
  customerId: string | null;
  firstName: string | null;
  lastName: string | null;
  taxId: string | null;
  email: string | null;
  phoneNumber: string | null;
  alternatePhone: string | null;
  street: string | null;
  exteriorNumber: string | null;
  interiorNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  cards: Array<{
    id: string;
    cardNumber: string;
  }>;
}

export function CustomerDetailDisplay({
  customerId,
  onBack,
}: CustomerDetailDisplayProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCardSelection, setShowCardSelection] = useState(false);
  const { register, handleSubmit, reset, setValue } =
    useForm<CustomerUpdateData>();

  const loadCustomerData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await getCustomerById(user, customerId);
      setCustomer(data);

      // Populate form with current data
      reset({
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        alternatePhone: data.alternatePhone || "",
        cellPhone: data.cellPhone || "", // Reset cellPhone
        street: data.street || "",
        exteriorNumber: data.exteriorNumber || "",
        interiorNumber: data.interiorNumber || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
        postalCode: data.postalCode || "",
        country: data.country || "",
      });
    } catch {
      toast.error("Error al cargar datos del cliente");
    } finally {
      setIsLoading(false);
    }
  }, [user, customerId, reset]);

  useEffect(() => {
    // Wait for auth to load and user to be available
    if (!authLoading && user) {
      loadCustomerData();
    } else if (!authLoading && !user) {
      // Auth loaded but no user - handle unauthorized
      toast.error("No authenticated user found");
      setIsLoading(false);
    }
  }, [user, authLoading, loadCustomerData]);

  const onSubmit = async (data: CustomerUpdateData) => {
    if (!user) {
      toast.error("No authenticated user found");
      return;
    }

    // Client-side validation for phone numbers
    if (data.alternatePhone && data.alternatePhone.length > 15) {
      toast.error("Alternate phone must not exceed 15 characters");
      return;
    }
    if (data.cellPhone) {
      const digitsOnly = data.cellPhone.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        toast.error("Cell phone must contain exactly 10 digits");
        return;
      }
    }
    
    try {
      setIsUpdating(true);
      const response = await updateCustomer(user, customerId, data);
      toast.success(response.message);
      await loadCustomerData(); // Reload customer data
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar datos"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShowCardSelection = () => {
    setShowCardSelection(true);
  };

  const handleSelectCard = (cardId: string) => {
    // Store card ID in session storage and navigate to payment page
    sessionStorage.setItem("selectedCardId", cardId);
    router.push("/cards/payment");
  };

  const handleBackFromCards = () => {
    setShowCardSelection(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando datos del cliente...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">No se pudo cargar la información del cliente</p>
      </div>
    );
  }

  // Show card selection view if requested
  if (showCardSelection) {
    return (
      <div className="space-y-6">
        {/* Customer Header */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {customer.firstName} {customer.lastName} - {customer.customerId} - {customer.taxId}
          </h2>
        </div>

        <CardSelectionTable
          cards={customer.cards}
          onSelectCard={handleSelectCard}
          onBack={handleBackFromCards}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {customer.firstName} {customer.lastName} - {customer.customerId} - {customer.taxId}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Account Information (Mock data for display) */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Último corte</p>
              <p className="text-gray-600">15/02/2018</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Cap. de pago total</p>
              <p className="text-gray-600">$950.00</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Último abono</p>
              <p className="text-gray-600">$4,188.54</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Cap. de pago disponible</p>
              <p className="text-gray-600">$940.30</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Pago total del mes</p>
              <p className="text-gray-600">$74.69</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Cap. de pago ocupada</p>
              <p className="text-gray-600">$9.70</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Fecha límite de pago</p>
              <p className="text-gray-600">05/03/2018</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Fecha último abono</p>
              <p className="text-gray-600">21/12/2017</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Estatus</p>
              <p className="text-gray-600">Al Corriente</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Saldo línea muebles</p>
              <p className="text-gray-600">$0.00</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Pago para comprar</p>
              <p className="text-gray-600">$0.00</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Saldo línea ropa</p>
              <p className="text-gray-600">$160.12</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Cliente candidato a</p>
              <p className="text-gray-600">No Aplica</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Saldo línea efectivo</p>
              <p className="text-gray-600">$0.00</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Saldo línea adicional</p>
              <p className="text-gray-600">$85.43</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Abono pendiente</p>
              <p className="text-gray-600">$0.00</p>
            </div>

            <div className="col-span-2">
              <p className="font-semibold text-gray-700">Pagos en línea</p>
              <p className="text-red-600 font-semibold">$0.00</p>
            </div>

            <div className="col-span-2">
              <p className="font-semibold text-gray-700">Pagos adelantados</p>
              <p className="text-red-600 font-semibold">$25.72</p>
            </div>

            <div className="col-span-2">
              <p className="font-semibold text-gray-700">% para Disposición de Efectivo</p>
              <p className="text-gray-600">42</p>
              <p className="text-gray-600">Disponible al 100%</p>
            </div>

            <div className="col-span-2">
              <p className="font-semibold text-gray-700">Disponible de Efvo hasta</p>
              <p className="text-gray-600">18M - $6,510.36</p>
            </div>

            <div className="col-span-2">
              <p className="font-semibold text-gray-700">Tipo de cliente</p>
              <p className="text-gray-600">A1 - 115%</p>
            </div>
          </div>
        </div>

        {/* Right Side - Edit Customer Data Form */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Editar los datos del Cliente
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">Estado:</Label>
                <Select
                  defaultValue={customer.state || ""}
                  onValueChange={(value) => setValue("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09 Ciudad de México">
                      09 Ciudad de México
                    </SelectItem>
                    <SelectItem value="Jalisco">Jalisco</SelectItem>
                    <SelectItem value="Nuevo León">Nuevo León</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="street">Calle:</Label>
                <Input
                  id="street"
                  {...register("street")}
                  placeholder="VENADOS MZ 5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Municipio:</Label>
                <Select
                  defaultValue={customer.city || ""}
                  onValueChange={(value) => setValue("city", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="005 Gustavo A. Madero">
                      005 Gustavo A. Madero
                    </SelectItem>
                    <SelectItem value="Guadalajara">Guadalajara</SelectItem>
                    <SelectItem value="Monterrey">Monterrey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="streetBetween">Entre calles:</Label>
                <Input id="streetBetween" placeholder="JAGUAR Y PAVOS" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="neighborhood">Colonia:</Label>
                <Select
                  defaultValue={customer.neighborhood || ""}
                  onValueChange={(value) => setValue("neighborhood", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jardines de Casa Blanca">
                      Jardines de Casa Blanca
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="exteriorNumber">No Exterior.:</Label>
                <Input
                  id="exteriorNumber"
                  {...register("exteriorNumber")}
                  placeholder="LT 6"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">C.P.:</Label>
                <Input
                  id="postalCode"
                  {...register("postalCode")}
                  placeholder="7180"
                />
              </div>

              <div>
                <Label htmlFor="interiorNumber">No Int.:</Label>
                <Input
                  id="interiorNumber"
                  {...register("interiorNumber")}
                  placeholder="No Interior"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Correo personal:</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Correo Personal"
                />
              </div>

              <div>
                <Label htmlFor="workEmail">Correo (Trabajo):</Label>
                <Input id="workEmail" type="email" placeholder="Correo (Trabajo)" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homePhone">Tel. Casa:</Label>
                <Input
                  id="homePhone"
                  {...register("phoneNumber")}
                  placeholder="5553068068"
                  maxLength={10}
                  onChange={(e) => {
                    // Only allow numeric characters and limit to 10
                    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setValue("phoneNumber", numericValue);
                    e.target.value = numericValue;
                  }}
                />
              </div>

              <div>
                <Label htmlFor="officePhone">Tel. Oficina:</Label>
                <Input
                  id="officePhone"
                  {...register("alternatePhone")}
                  placeholder="5553068068"
                  maxLength={10}
                  onChange={(e) => {
                    // Only allow numeric characters and limit to 10
                    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setValue("alternatePhone", numericValue);
                    e.target.value = numericValue;
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cellPhone">Tel. Celular:</Label>
                <Input
                  id="cellPhone"
                  {...register("cellPhone")}
                  placeholder="5551234567"
                  maxLength={10}
                  onChange={(e) => {
                    // Only allow numeric characters and limit to 10
                    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setValue("cellPhone", numericValue);
                    e.target.value = numericValue;
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onBack}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                Regresar
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                {isUpdating ? "Actualizando..." : "Actualizar Datos"}
              </Button>
            </div>
          </form>

          {/* Card Payment Button */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Gestión de Tarjetas
            </h4>
            <Button
              type="button"
              onClick={handleShowCardSelection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Seleccionar Tarjeta para Pago
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
