"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerSearchResult } from "@/lib/actions/customers";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CustomerSelectionTableProps {
  customers: CustomerSearchResult[];
  onSelectCustomer: (customerId: string) => void;
  onBack: () => void;
}

export function CustomerSelectionTable({
  customers,
  onSelectCustomer,
  onBack,
}: CustomerSelectionTableProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const handleSelect = () => {
    if (!selectedCustomerId) {
      return;
    }
    onSelectCustomer(selectedCustomerId);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="bg-blue-600 text-white py-3 px-4">
        <ul className="list-none">
          <li>• Búsqueda de cliente y pago</li>
        </ul>
      </div>

      <h2 className="text-2xl font-normal text-gray-800">
        Selecciona a tu cliente
      </h2>

      {/* Info message */}
      <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded">
        Selecciona al cliente para actualizar sus datos o trabajar con sus cuentas.
      </div>

      {/* Results Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold text-gray-700">
                No. Cliente
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Nombre
              </TableHead>
              <TableHead className="font-semibold text-gray-700">RFC</TableHead>
              <TableHead className="font-semibold text-gray-700">
                Dirección
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Teléfono
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                className={
                  selectedCustomerId === customer.id ? "bg-blue-50" : ""
                }
              >
                <TableCell>
                  <RadioGroup
                    value={selectedCustomerId}
                    onValueChange={setSelectedCustomerId}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value={customer.id} id={customer.id} />
                    </div>
                  </RadioGroup>
                </TableCell>
                <TableCell className="font-mono">
                  {customer.customerId || "-"}
                </TableCell>
                <TableCell className="uppercase">
                  {customer.firstName} {customer.lastName}
                </TableCell>
                <TableCell>{customer.taxId || "-"}</TableCell>
                <TableCell className="max-w-md truncate">
                  {[
                    customer.street,
                    customer.city,
                    customer.state,
                    customer.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </TableCell>
                <TableCell>{customer.phoneNumber || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSelect}
          disabled={!selectedCustomerId}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Seleccionar cliente
        </Button>
        <Button
          onClick={onBack}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white px-6"
        >
          Regresar
        </Button>
      </div>
    </div>
  );
}
