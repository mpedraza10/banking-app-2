"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getCardInfo, getCardNumberById } from "@/lib/actions/card-payments";


export default function CardPaymentPage() {
  return (
    <ProtectedRoute>
      <CardPaymentContent />
    </ProtectedRoute>
  );
}

function CardPaymentContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for pre-selected card ID from customer selection
  useEffect(() => {
    // Only proceed if user is authenticated
    if (!user) {
      return;
    }

    const selectedCardId = sessionStorage.getItem("selectedCardId");
    if (selectedCardId) {
      // Clear the session storage immediately
      sessionStorage.removeItem("selectedCardId");
      
      // Fetch the card number to get the full unmasked value
      const fetchCardNumber = async () => {
        try {
          setIsLoading(true);
          // Get the full unmasked card number using the card ID
          const fullCardNumber = await getCardNumberById(user, selectedCardId);
          
          if (fullCardNumber) {
            // Set the full card number and automatically search
            setCardNumber(formatCardNumber(fullCardNumber));
            handleSearchCard(fullCardNumber);
          } else {
            toast.error("No se pudo encontrar la tarjeta");
          }
        } catch (error) {
          console.error("Error fetching card number:", error);
          toast.error("Error al cargar los detalles de la tarjeta");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCardNumber();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user - run when authentication completes


  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Limit to 16 digits
    if (value.length > 16) {
      return;
    }

    setCardNumber(formatCardNumber(value));
    setError(null);
  };

  const handleSearchCard = async (preselectedCard?: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    const cleanCardNumber = (preselectedCard || cardNumber).replace(/\s/g, "");

    // V1.1: Validate card number format - must be exactly 16 digits
    if (cleanCardNumber.length !== 16) {
      setError("Número de tarjeta incorrecto");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cardInfo = await getCardInfo(user, cleanCardNumber);

      if (!cardInfo) {
        setError("Favor de indicar un número de tarjeta válido. Tarjeta no encontrada en el sistema.");
        return;
      }

      // Store card info in session storage and navigate to account statement
      sessionStorage.setItem("currentCardInfo", JSON.stringify(cardInfo));
      router.push("/cards/account-statement");
    } catch (err) {
      console.error("Error searching card:", err);
      setError(
        err instanceof Error ? err.message : "Error al buscar la tarjeta. Por favor intente nuevamente."
      );
      toast.error("Error al buscar la tarjeta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && cardNumber.replace(/\s/g, "").length === 16) {
      handleSearchCard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Buscar tarjeta</h1>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            Proporciona el número de tarjeta del cliente y da clic en BUSCAR TARJETA
          </AlertDescription>
        </Alert>

        {/* Card Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-600">
              DATOS DE TARJETA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Card Number Input */}
            <div>
              <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                No. de tarjeta
              </Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="No. de tarjeta"
                value={cardNumber}
                onChange={handleCardNumberChange}
                onKeyPress={handleKeyPress}
                className="mt-1 max-w-md"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search Button */}
            <div>
              <Button
                onClick={() => handleSearchCard()}
                disabled={isLoading || cardNumber.replace(/\s/g, "").length !== 16}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Buscando..." : "Buscar Tarjeta"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
