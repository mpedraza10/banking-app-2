"use client";

import { useState } from "react";
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
import { useAuth } from "@/lib/hooks/useAuth";
import { searchCustomers } from "@/lib/actions/customers";
import type { CustomerSearchFilters, CustomerSearchResult } from "@/lib/actions/customers";
import { toast } from "sonner";

interface CustomerSearchFormProps {
  onSearchComplete: (results: CustomerSearchResult[]) => void;
  onReset?: () => void;
}

export function CustomerSearchForm({
  onSearchComplete,
  onReset,
}: CustomerSearchFormProps) {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<CustomerSearchFilters>();

  const onSubmit = async (data: CustomerSearchFilters) => {
    try {
      setIsSearching(true);

      // Count non-empty criteria
      const criteriaCount = Object.values(data).filter(
        (value) => value && value.toString().trim() !== ""
      ).length;

      if (criteriaCount < 2) {
        toast.error("Llena alguno de los campos solicitados para iniciar la búsqueda del cliente.");
        return;
      }

      const response = await searchCustomers(user, data);

      if (response.totalResults === 0) {
        toast.info("No hay información de búsqueda");
        onSearchComplete([]);
      } else {
        onSearchComplete(response.data);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al buscar cliente");
      onSearchComplete([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    reset();
    onReset?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Info message */}
      <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded">
        Llena alguno de los campos solicitados para iniciar la búsqueda del cliente.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DATOS DE TELÉFONO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700">
              DATOS DE TELÉFONO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Teléfono de casa</Label>
              <Input
                id="phoneNumber"
                placeholder="Teléfono de casa"
                {...register("phoneNumber")}
              />
            </div>
            <div>
              <Label htmlFor="alternatePhone">Celular</Label>
              <Input
                id="alternatePhone"
                placeholder="Celular"
                {...register("alternatePhone")}
              />
            </div>
          </CardContent>
        </Card>

        {/* DATOS DE DIRECCIÓN */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700">
              DATOS DE DIRECCIÓN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">Estado</Label>
                <Select onValueChange={(value) => setValue("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09 Ciudad de México">09 Ciudad de México</SelectItem>
                    <SelectItem value="Jalisco">Jalisco</SelectItem>
                    <SelectItem value="Nuevo León">Nuevo León</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">Municipio</Label>
                <Select onValueChange={(value) => setValue("city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="005 Gustavo A. Madero">005 Gustavo A. Madero</SelectItem>
                    <SelectItem value="Guadalajara">Guadalajara</SelectItem>
                    <SelectItem value="Monterrey">Monterrey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="neighborhood">Colonia</Label>
                <Select onValueChange={(value) => setValue("neighborhood", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jardines de Casa Blanca">Jardines de Casa Blanca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="postalCode">CP</Label>
                <Input
                  id="postalCode"
                  placeholder="CP"
                  {...register("postalCode")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DATOS DEL CLIENTE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700">
              DATOS DEL CLIENTE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerId">No. de cliente</Label>
              <Input
                id="customerId"
                placeholder="No. de cliente"
                {...register("customerId")}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lastName">Ap. paterno</Label>
                <Input
                  id="lastName"
                  placeholder="ESQUIVEL"
                  {...register("lastName")}
                />
              </div>
              <div>
                <Label htmlFor="middleName">Ap. materno</Label>
                <Input
                  id="middleName"
                  placeholder="VELAZQUEZ"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Fecha de nac.</Label>
                <Input
                  id="birthDate"
                  type="date"
                  placeholder="Fecha de nac."
                  {...register("birthDate")}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="taxId">RFC</Label>
              <Input
                id="taxId"
                placeholder="RFC"
                {...register("taxId")}
              />
            </div>
          </CardContent>
        </Card>

        {/* DATOS OFICIALES */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700">
              DATOS OFICIALES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ife">IFE</Label>
              <Input id="ife" placeholder="IFE" />
            </div>
            <div>
              <Label htmlFor="passport">Pasaporte</Label>
              <Input id="passport" placeholder="Pasaporte" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSearching}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          {isSearching ? "Buscando..." : "Buscar Cliente"}
        </Button>
        <Button
          type="button"
          onClick={handleReset}
          variant="outline"
          className="bg-cyan-400 hover:bg-cyan-500 text-white border-0 px-6"
        >
          Limpiar Consulta
        </Button>
      </div>
    </form>
  );
}
