"use client";

import { ServicePaymentForm } from "@/components/services/service-payment-form";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAvailableServices, validateServiceReference } from "@/lib/actions/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServicePaymentPage() {
  const { user } = useAuth();

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
    try {
      // We need to import validateServiceReference from server actions
      // But it's a server action, so we can call it directly if it's imported
      // However, validateServiceReference requires a user object which we have
      // But we also need to handle the customerId if we want to check for BAF account
      // For now, let's just validate the reference format and get basic commission
      
      const result = await validateServiceReference(user, serviceId, reference);
      
      if (!result.isValid) {
        throw new Error(result.message || "Invalid reference");
      }
      
      return result;
    } catch (error) {
      console.error("Validation error:", error);
      throw error;
    }
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
      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Pago de Servicios</h1>
          <div className="flex gap-4 mt-4 text-sm">
            <Button variant="ghost" className="font-medium text-gray-700 border-b-2 border-gray-700 pb-2 hover:bg-gray-100">
              Transacciones
            </Button>
            <Button variant="ghost" className="text-blue-600 hover:bg-gray-100 hover:text-blue-700 pb-2">
              Monto a cobrar
            </Button>
            <Button variant="ghost" className="text-blue-600 hover:bg-gray-100 hover:text-blue-700 pb-2">
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
              user={user}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
