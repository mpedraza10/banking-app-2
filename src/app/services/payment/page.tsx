"use client";

import { useState } from "react";
import { ServicePaymentForm } from "@/components/services/service-payment-form";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAvailableServices } from "@/lib/actions/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServicePaymentPage() {
  const { user } = useAuth();
  const [, setSelectedCustomer] = useState<string | null>(null);

  // Fetch available services
  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useQuery({
    queryKey: ["services"],
    queryFn: () => getAvailableServices(user),
    enabled: !!user,
  });

  const handleSubmit = async (data: unknown) => {
    console.log("Processing service payment:", data);
    // Will implement full processing in next subtask
  };

  const handleValidateReference = async (serviceId: string, reference: string) => {
    console.log("Validating reference:", serviceId, reference);
    // Will implement full validation in next subtask
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load services. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const services = servicesData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-4 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">BAF</span>
                </div>
                <span className="font-semibold">Caja Corporativa</span>
              </div>
              <nav className="flex gap-4 ml-8">
                <Button className="text-sm hover:underline">Caja bancaria</Button>
                <Button className="text-sm hover:underline">Flujo Efectivo</Button>
                <Button className="text-sm font-semibold border-b-2 border-white">
                  Transacciones
                </Button>
              </nav>
            </div>
            <Button className="text-sm hover:underline">Tu cuenta</Button>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Pago de Servicios</h1>
          <div className="flex gap-4 mt-4 text-sm">
            <Button className="font-medium text-gray-700 border-b-2 border-gray-700 pb-2">
              Transacciones
            </Button>
            <Button className="text-blue-600 hover:underline pb-2">
              Monto a cobrar
            </Button>
            <Button className="text-blue-600 hover:underline pb-2">
              Monto a pagar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Payment Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <ServicePaymentForm
              services={services}
              onSubmit={handleSubmit}
              onValidateReference={handleValidateReference}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
