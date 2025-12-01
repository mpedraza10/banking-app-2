"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AVAILABLE_DENOMINATIONS } from "@/lib/actions/denominations";
import type { DenominationEntry, CashDrawerBalance } from "@/lib/actions/denominations";

interface ChangeDispensingInterfaceProps {
  changeAmount: number;
  currentBalance: CashDrawerBalance[];
  transactionId?: string;
  onSubmit: (denominations: DenominationEntry[]) => Promise<void>;
  onAutoCalculate?: () => void;
}

export function ChangeDispensingInterface({
  changeAmount,
  currentBalance,
  onSubmit,
  onAutoCalculate,
}: ChangeDispensingInterfaceProps) {
  const [denominations, setDenominations] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create balance lookup map
  const balanceMap = new Map(
    currentBalance.map((item) => [item.denomination, item.quantity])
  );

  // Calculate total from entered denominations
  const calculatedTotal = Object.entries(denominations).reduce(
    (sum, [denom, qty]) => sum + parseFloat(denom) * qty,
    0
  );

  // Check if totals match
  const totalsMatch = Math.abs(calculatedTotal - changeAmount) < 0.01;

  // Check if denomination is insufficient
  const isDeficient = (denomination: number, requested: number): boolean => {
    const available = balanceMap.get(denomination) || 0;
    return requested > available;
  };

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

    // Check for insufficient denominations
    const deficientDenoms = Object.entries(denominations).filter(
      ([denom, qty]) => isDeficient(parseFloat(denom), qty)
    );

    if (deficientDenoms.length > 0) {
      setError("Denominaciones insuficientes en caja. Marcadas en rojo.");
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
        err instanceof Error ? err.message : "Error al dispensar cambio"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billetes (Bills) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Billetes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bills.map((denomination) => {
              const qty = denominations[denomination] || 0;
              const available = balanceMap.get(denomination) || 0;
              const insufficient = qty > 0 && isDeficient(denomination, qty);
              const inputId = `change-bill-${denomination}`;

              return (
                <div
                  key={denomination}
                  className="flex items-center justify-between gap-4"
                >
                  <label
                    htmlFor={inputId}
                    className={`text-sm font-medium min-w-[120px] ${
                      insufficient ? "text-red-600" : ""
                    }`}
                  >
                    ${denomination.toFixed(2)}
                    <span
                      className={
                        insufficient ? "text-red-600 ml-1" : "text-blue-600 ml-1"
                      }
                    >
                      ({available})
                    </span>
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
                    className={`w-32 ${
                      insufficient ? "border-red-500 bg-red-50" : ""
                    }`}
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
              const available = balanceMap.get(denomination) || 0;
              const insufficient = qty > 0 && isDeficient(denomination, qty);
              const inputId = `change-coin-${denomination}`;

              return (
                <div
                  key={denomination}
                  className="flex items-center justify-between gap-4"
                >
                  <label
                    htmlFor={inputId}
                    className={`text-sm font-medium min-w-[120px] ${
                      insufficient ? "text-red-600" : ""
                    }`}
                  >
                    ${denomination.toFixed(2)}
                    <span
                      className={
                        insufficient ? "text-red-600 ml-1" : "text-blue-600 ml-1"
                      }
                    >
                      ({available})
                    </span>
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
                    className={`w-32 ${
                      insufficient ? "border-red-500 bg-red-50" : ""
                    }`}
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
        <span className={!totalsMatch && calculatedTotal > 0 ? "text-red-600" : ""}>
          ${calculatedTotal.toFixed(2)}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-start gap-3">
        {onAutoCalculate && (
          <Button
            onClick={onAutoCalculate}
            variant="outline"
            disabled={isSubmitting}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Actualizar Denominaciones
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !totalsMatch || calculatedTotal === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Procesando..." : "Postear"}
        </Button>
        <Button
          variant="outline"
          disabled={isSubmitting}
          className="border-gray-400 text-gray-700"
        >
          Mas
        </Button>
      </div>
    </div>
  );
}
