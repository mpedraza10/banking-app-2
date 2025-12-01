"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getCustomerById, updateCustomer } from "@/lib/actions/customers";
import type { CustomerUpdateData } from "@/lib/actions/customers";
import { getPromotionalOffers } from "@/lib/actions/card-payments";
import type { PromotionalOffer } from "@/lib/actions/card-payments";
import { toast } from "sonner";
import { CardSelectionTable } from "./card-selection-table";
import {
  ESTADOS_MEXICO,
  getMunicipiosPorEstado,
  getColoniasPorMunicipio,
  buscarEstadoPorNombre,
  buscarMunicipioPorNombre,
  buscarPorCodigoPostal,
  validarConsistenciaGeografica,
} from "@/lib/utils/mexico-geography";

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
  const [promotions, setPromotions] = useState<PromotionalOffer[]>([]);
  const [showPromotions, setShowPromotions] = useState(true);
  const [selectedEstadoId, setSelectedEstadoId] = useState<string>("");
  const [selectedMunicipioId, setSelectedMunicipioId] = useState<string>("");
  const [postalCodeSearch, setPostalCodeSearch] = useState<string>("");
  const [isSearchingByCP, setIsSearchingByCP] = useState(false);
  const [geoValidationError, setGeoValidationError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } =
    useForm<CustomerUpdateData>();

  // Obtener municipios según el estado seleccionado
  const municipiosDisponibles = useMemo(() => {
    if (!selectedEstadoId) return [];
    return getMunicipiosPorEstado(selectedEstadoId);
  }, [selectedEstadoId]);

  // Obtener colonias según el municipio seleccionado
  const coloniasDisponibles = useMemo(() => {
    if (!selectedMunicipioId) return [];
    return getColoniasPorMunicipio(selectedMunicipioId);
  }, [selectedMunicipioId]);

  // Función para buscar por código postal (búsqueda inversa)
  const handleSearchByPostalCode = useCallback(() => {
    if (!postalCodeSearch || postalCodeSearch.length < 4) {
      toast.error("Ingrese un código postal válido (mínimo 4 dígitos)");
      return;
    }

    setIsSearchingByCP(true);
    setGeoValidationError(null);

    const resultado = buscarPorCodigoPostal(postalCodeSearch);

    if (!resultado) {
      toast.error("Código postal no encontrado en el catálogo");
      setIsSearchingByCP(false);
      return;
    }

    // Auto-seleccionar estado
    setSelectedEstadoId(resultado.estado.id);
    setValue("state", resultado.estado.nombre);

    // Auto-seleccionar municipio
    setSelectedMunicipioId(resultado.municipio.id);
    setValue("city", resultado.municipio.nombre);

    // Actualizar código postal
    setValue("postalCode", postalCodeSearch);

    // Actualizar el estado del cliente localmente
    if (customer) {
      setCustomer({
        ...customer,
        state: resultado.estado.nombre,
        city: resultado.municipio.nombre,
        postalCode: postalCodeSearch,
        neighborhood: resultado.colonias.length === 1 ? resultado.colonias[0].nombre : null,
      });
    }

    // Si solo hay una colonia, auto-seleccionarla
    if (resultado.colonias.length === 1) {
      setValue("neighborhood", resultado.colonias[0].nombre);
      toast.success(`Encontrado: ${resultado.estado.nombre}, ${resultado.municipio.nombre}, ${resultado.colonias[0].nombre}`);
    } else {
      setValue("neighborhood", "");
      toast.success(`Encontradas ${resultado.colonias.length} colonias para C.P. ${postalCodeSearch}. Seleccione una colonia.`);
    }

    setIsSearchingByCP(false);
  }, [postalCodeSearch, customer, setValue]);

  // Load promotional offers for the customer
  const loadPromotions = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch promotions (using default card type and estimated balance)
      const offers = await getPromotionalOffers(user, "GENERAL", 1000);
      setPromotions(offers);
    } catch (error) {
      console.error("Error loading promotions:", error);
    }
  }, [user]);

  const loadCustomerData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await getCustomerById(user, customerId);
      setCustomer(data);

      // Buscar el estado por nombre y establecer su ID
      if (data.state) {
        const estado = buscarEstadoPorNombre(data.state);
        if (estado) {
          setSelectedEstadoId(estado.id);
          // Si hay ciudad/municipio, buscar en ese estado
          if (data.city) {
            const municipio = buscarMunicipioPorNombre(data.city, estado.id);
            if (municipio) {
              setSelectedMunicipioId(municipio.id);
            }
          }
        }
      }

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
      loadPromotions();
    } else if (!authLoading && !user) {
      // Auth loaded but no user - handle unauthorized
      toast.error("No authenticated user found");
      setIsLoading(false);
    }
  }, [user, authLoading, loadCustomerData, loadPromotions]);

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

    // A2.5: Validación de consistencia geográfica antes de guardar
    if (customer?.state && customer?.city && customer?.neighborhood && customer?.postalCode) {
      const validacion = validarConsistenciaGeografica(
        customer.state,
        customer.city,
        customer.neighborhood,
        customer.postalCode
      );
      
      if (!validacion.esValido) {
        setGeoValidationError(validacion.mensaje);
        toast.error(`Favor de indicar: ${validacion.mensaje}`);
        return;
      }
    }
    
    // Limpiar error de validación geográfica si pasó
    setGeoValidationError(null);
    
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
            {/* Búsqueda por Código Postal */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <Label htmlFor="postalCodeSearch" className="text-blue-700 font-medium text-sm">
                Buscar por Código Postal:
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="postalCodeSearch"
                  value={postalCodeSearch}
                  onChange={(e) => setPostalCodeSearch(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="Ingrese C.P. (ej: 07180)"
                  className="flex-1"
                  maxLength={5}
                />
                <Button
                  type="button"
                  onClick={handleSearchByPostalCode}
                  disabled={isSearchingByCP || postalCodeSearch.length < 4}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                  {isSearchingByCP ? "Buscando..." : "Buscar"}
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Ingrese el C.P. para auto-completar Estado, Municipio y Colonias disponibles
              </p>
            </div>

            {/* Error de validación geográfica */}
            {geoValidationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{geoValidationError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">Estado:</Label>
                <Select
                  value={customer.state || ""}
                  onValueChange={(value) => {
                    // Encontrar el estado seleccionado para obtener su ID
                    const estado = ESTADOS_MEXICO.find((e) => e.nombre === value);
                    setSelectedEstadoId(estado?.id || "");
                    // Limpiar municipio, colonia y C.P. al cambiar estado
                    setSelectedMunicipioId("");
                    setValue("city", "");
                    setValue("neighborhood", "");
                    setValue("postalCode", "");
                    setValue("state", value);
                    setGeoValidationError(null);
                    // Actualizar el estado del cliente localmente
                    if (customer) {
                      setCustomer({ ...customer, state: value, city: null, neighborhood: null, postalCode: null });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_MEXICO.map((estado) => (
                      <SelectItem key={estado.id} value={estado.nombre}>
                        {estado.id} - {estado.nombre}
                      </SelectItem>
                    ))}
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
                  value={customer.city || ""}
                  onValueChange={(value) => {
                    // Encontrar el municipio seleccionado para obtener su ID
                    const municipio = municipiosDisponibles.find((m) => m.nombre === value);
                    setSelectedMunicipioId(municipio?.id || "");
                    // Limpiar colonia y C.P. al cambiar municipio
                    setValue("neighborhood", "");
                    setValue("postalCode", "");
                    setValue("city", value);
                    setGeoValidationError(null);
                    // Actualizar el estado del cliente localmente
                    if (customer) {
                      setCustomer({ ...customer, city: value, neighborhood: null, postalCode: null });
                    }
                  }}
                  disabled={!selectedEstadoId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedEstadoId ? "Seleccione un municipio" : "Primero seleccione un estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {municipiosDisponibles.map((municipio) => (
                      <SelectItem key={municipio.id} value={municipio.nombre}>
                        {municipio.nombre}
                      </SelectItem>
                    ))}
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
                  value={customer.neighborhood || ""}
                  onValueChange={(value) => {
                    // Actualizar código postal automáticamente si hay colonia
                    const colonia = coloniasDisponibles.find((c) => c.nombre === value);
                    if (colonia?.codigoPostal) {
                      setValue("postalCode", colonia.codigoPostal);
                      setGeoValidationError(null);
                      if (customer) {
                        setCustomer({ ...customer, neighborhood: value, postalCode: colonia.codigoPostal });
                      }
                    } else if (customer) {
                      setCustomer({ ...customer, neighborhood: value });
                    }
                    setValue("neighborhood", value);
                  }}
                  disabled={!selectedMunicipioId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedMunicipioId ? "Seleccione una colonia" : "Primero seleccione un municipio"} />
                  </SelectTrigger>
                  <SelectContent>
                    {coloniasDisponibles.map((colonia) => (
                      <SelectItem key={colonia.id} value={colonia.nombre}>
                        {colonia.nombre} (C.P. {colonia.codigoPostal})
                      </SelectItem>
                    ))}
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
                  value={customer.postalCode || ""}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="Se actualiza al seleccionar colonia"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El C.P. se actualiza automáticamente al seleccionar una colonia
                </p>
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

      {/* Promotional Offers Section */}
      {promotions.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Gift className="h-5 w-5 text-blue-600" />
              Promociones Activas para el Cliente
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPromotions(!showPromotions)}
            >
              {showPromotions ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
          
          {showPromotions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.map((promo) => (
                <Card key={promo.id} className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-blue-900 flex items-center justify-between">
                      {promo.title}
                      {promo.discountType === "percentage" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {promo.discountValue}% Desc.
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ${promo.discountValue} Desc.
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-800 mb-2">{promo.description}</p>
                    <div className="text-xs text-blue-700 space-y-1">
                      {promo.minPaymentAmount && (
                        <p>Pago mínimo: ${promo.minPaymentAmount.toFixed(2)}</p>
                      )}
                      {promo.maxDiscount && (
                        <p>Descuento máximo: ${promo.maxDiscount.toFixed(2)}</p>
                      )}
                      <p>Válido hasta: {new Date(promo.validUntil).toLocaleDateString("es-MX")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No promotions message */}
      {promotions.length === 0 && (
        <div className="mt-6 pt-6 border-t">
          <Alert className="border-gray-200 bg-gray-50">
            <Gift className="h-4 w-4" />
            <AlertDescription className="text-gray-600">
              No hay promociones disponibles para este cliente en este momento.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
