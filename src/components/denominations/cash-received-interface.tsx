"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AVAILABLE_DENOMINATIONS } from "@/lib/actions/denominations";
import type { DenominationEntry } from "@/lib/actions/denominations";

interface CashReceivedInterfaceProps {
  expectedAmount: number;
  transactionId: string;
  onSubmit: (denominations: DenominationEntry[]) => Promise<void>;
  onCancel?: () => void;
}

export function CashReceivedInterface({
  expectedAmount,
  transactionId,
  onSubmit,
  onCancel,
}: CashReceivedInterfaceProps) {
  const [denominations, setDenominations] = useState<
    Record<number, number>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total from entered denominations
  const calculatedTotal = Object.entries(denominations).reduce(
    (sum, [denom, qty]) => sum + parseFloat(denom) * qty,
    0
  );

  // Check if totals match
  const totalsMatch = Math.abs(calculatedTotal - expectedAmount) < 0.01;

  // Handle denomination quantity change
  const handleDenominationChange = (denomination: number, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    
    setDenominations((prev) => {
      const updated = { ...prev };
      if (qty === 0) {
        delete updated[denomination];
      } else {
        updated[denomination] = qty;
      }
      return updated;
    });
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!totalsMatch) {
      setError("Total entrada de denominaciones no coincide");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const denominationEntries: DenominationEntry[] = Object.entries(
        denominations
      ).map(([denom, qty]) => ({
        denomination: parseFloat(denom),
        quantity: qty,
        amount: parseFloat(denom) * qty,
      }));

      await onSubmit(denominationEntries);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al registrar denominaciones"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separate bills and coins
  const bills = AVAILABLE_DENOMINATIONS.filter((d) => d >= 20);
  const coins = AVAILABLE_DENOMINATIONS.filter((d) => d < 20);

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-800">
          Captura las denominaciones de efectivo que recibes del cliente y da clic
          en POSTEAR.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billetes (Bills) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Billetes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bills.map((denomination) => {
              const qty = denominations[denomination] || 0;
              const count = qty > 0 ? `(${qty})` : "";
              const inputId = `cash-received-bill-${denomination}`;

              return (
                <div
                  key={denomination}
                  className="flex items-center justify-between gap-4"
                >
                  <label htmlFor={inputId} className="text-sm font-medium min-w-[120px]">
                    ${denomination.toFixed(2)}
                    {count && (
                      <span className="text-blue-600 ml-1">{count}</span>
                    )}
                  </label>
                  <Input
                    id={inputId}
                    type="number"
                    min="0"
                    step="1"
                    value={denominations[denomination] || ""}
                    onChange={(e) =>
                      handleDenominationChange(denomination, e.target.value)
                    }
                    className="w-32"
                    placeholder="0"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Monedas (Coins) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monedas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coins.map((denomination) => {
              const qty = denominations[denomination] || 0;
              const count = qty > 0 ? `(${qty})` : "";
              const inputId = `cash-received-coin-${denomination}`;

              return (
                <div
                  key={denomination}
                  className="flex items-center justify-between gap-4"
                >
                  <label htmlFor={inputId} className="text-sm font-medium min-w-[120px]">
                    ${denomination.toFixed(2)}
                    {count && (
                      <span className="text-blue-600 ml-1">{count}</span>
                    )}
                  </label>
                  <Input
                    id={inputId}
                    type="number"
                    min="0"
                    step="1"
                    value={denominations[denomination] || ""}
                    onChange={(e) =>
                      handleDenominationChange(denomination, e.target.value)
                    }
                    className="w-32"
                    placeholder="0"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Total Display */}
      <div className="flex items-center justify-between text-lg font-bold border-t-2 pt-4">
        <span>TOTAL:</span>
        <span>${calculatedTotal.toFixed(2)}</span>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-start gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !totalsMatch || calculatedTotal === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Procesando..." : "Postear"}
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="destructive"
            disabled={isSubmitting}
          >
            Regresar
          </Button>
        )}
      </div>
    </div>
  );
}
