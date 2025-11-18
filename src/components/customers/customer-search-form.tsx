"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useAuth } from "@/lib/hooks/useAuth";
import { searchCustomers } from "@/lib/actions/customers";
import type { CustomerSearchResult } from "@/lib/actions/customers";
import { toast } from "sonner";

// Zod schema for customer search form validation
const customerSearchSchema = z
  .object({
    customerId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    middleName: z.string().optional(),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // Optional field
          // Remove non-digit characters and check if exactly 10 digits
          const digitsOnly = val.replace(/\D/g, "");
          return /^[\d\s\-()]+$/.test(val) && digitsOnly.length === 10;
        },
        "El teléfono debe contener exactamente 10 dígitos"
      ),
    alternatePhone: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // Optional field
          // Remove non-digit characters and check if exactly 10 digits
          const digitsOnly = val.replace(/\D/g, "");
          return /^[\d\s\-()]+$/.test(val) && digitsOnly.length === 10;
        },
        "El celular debe contener exactamente 10 dígitos"
      ),
    birthDate: z.string().optional(),
    taxId: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(val.toUpperCase()),
        "El RFC debe tener un formato válido"
      ),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    neighborhood: z.string().optional(),
    postalCode: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{5}$/.test(val),
        "El código postal debe tener 5 dígitos"
      ),
    ife: z.string().optional(),
    passport: z.string().optional(),
  })
  .refine(
    (data) => {
      // Count non-empty criteria
      const criteriaCount = Object.values(data).filter(
        (value) => value && value.toString().trim() !== ""
      ).length;
      return criteriaCount >= 2;
    },
    {
      message: "Debe llenar al menos 2 campos para iniciar la búsqueda",
      path: ["root"],
    }
  );

type CustomerSearchFormData = z.infer<typeof customerSearchSchema>;

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
  
  const form = useForm<CustomerSearchFormData>({
    resolver: zodResolver(customerSearchSchema),
    defaultValues: {
      customerId: "",
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      alternatePhone: "",
      birthDate: "",
      taxId: "",
      street: "",
      city: "",
      state: "",
      neighborhood: "",
      postalCode: "",
      ife: "",
      passport: "",
    },
  });

  const onSubmit = async (data: CustomerSearchFormData) => {
    try {
      setIsSearching(true);

      // Filter out empty values
      const searchFilters = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value && value.toString().trim() !== "")
      );

      const response = await searchCustomers(user, searchFilters);

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
    form.reset();
    onReset?.();
  };

  return (
    <form id="customer-search-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Info message */}
      <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded">
        <p className="font-medium mb-1">Debe llenar al menos 2 campos para iniciar la búsqueda del cliente.</p>
        <p className="text-sm">Todos los campos son opcionales. Puede usar cualquier combinación de campos para realizar la búsqueda.</p>
      </div>

      {/* Root validation error */}
      {form.formState.errors.root && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          <FieldError errors={[form.formState.errors.root]} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DATOS DE TELÉFONO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700">
              DATOS DE TELÉFONO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phoneNumber">
                    Teléfono de casa
                  </FieldLabel>
                  <Input
                    {...field}
                    id="phoneNumber"
                    placeholder="Teléfono de casa"
                    aria-invalid={fieldState.invalid}
                    autoComplete="tel"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="alternatePhone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="alternatePhone">
                    Celular
                  </FieldLabel>
                  <Input
                    {...field}
                    id="alternatePhone"
                    placeholder="Celular"
                    aria-invalid={fieldState.invalid}
                    autoComplete="tel"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
              <Controller
                name="state"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="state">
                      Estado
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="state" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Seleccione una" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09 Ciudad de México">09 Ciudad de México</SelectItem>
                        <SelectItem value="Jalisco">Jalisco</SelectItem>
                        <SelectItem value="Nuevo León">Nuevo León</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="city">
                      Municipio
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="city" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Seleccione una" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="005 Gustavo A. Madero">005 Gustavo A. Madero</SelectItem>
                        <SelectItem value="Guadalajara">Guadalajara</SelectItem>
                        <SelectItem value="Monterrey">Monterrey</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="neighborhood"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="neighborhood">
                      Colonia
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="neighborhood" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Seleccione una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jardines de Casa Blanca">Jardines de Casa Blanca</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="postalCode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="postalCode">
                      CP
                    </FieldLabel>
                    <Input
                      {...field}
                      id="postalCode"
                      placeholder="CP"
                      aria-invalid={fieldState.invalid}
                      autoComplete="postal-code"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
            <Controller
              name="customerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customerId">
                    No. de cliente
                  </FieldLabel>
                  <Input
                    {...field}
                    id="customerId"
                    placeholder="No. de cliente"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastName">
                      Ap. paterno
                    </FieldLabel>
                    <Input
                      {...field}
                      id="lastName"
                      placeholder="ESQUIVEL"
                      aria-invalid={fieldState.invalid}
                      autoComplete="family-name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="middleName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="middleName">
                      Ap. materno
                    </FieldLabel>
                    <Input
                      {...field}
                      id="middleName"
                      placeholder="VELAZQUEZ"
                      aria-invalid={fieldState.invalid}
                      autoComplete="additional-name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="birthDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="birthDate">
                      Fecha de nac.
                    </FieldLabel>
                    <Input
                      {...field}
                      id="birthDate"
                      type="date"
                      placeholder="Fecha de nac."
                      aria-invalid={fieldState.invalid}
                      autoComplete="bday"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="taxId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="taxId">
                    RFC
                  </FieldLabel>
                  <Input
                    {...field}
                    id="taxId"
                    placeholder="RFC"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    onChange={(e) => {
                      // Convert to uppercase for RFC
                      field.onChange(e.target.value.toUpperCase());
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
            <Controller
              name="ife"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ife">
                    IFE
                  </FieldLabel>
                  <Input
                    {...field}
                    id="ife"
                    placeholder="IFE"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="passport"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="passport">
                    Pasaporte
                  </FieldLabel>
                  <Input
                    {...field}
                    id="passport"
                    placeholder="Pasaporte"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          form="customer-search-form"
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
