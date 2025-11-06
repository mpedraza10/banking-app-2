"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, Coins, RefreshCw } from "lucide-react";

interface Denomination {
  value: number;
  quantity: number;
  total: number;
}

interface DenominationEntryProps {
  denominations: Denomination[];
  onQuantityChange: (value: number, quantity: number) => void;
  title: string;
  type: "bills" | "coins";
}

export function DenominationEntry({
  denominations,
  onQuantityChange,
  title,
  type,
}: DenominationEntryProps) {
  const icon = type === "bills" ? <Banknote className="h-5 w-5" /> : <Coins className="h-5 w-5" />;

  return (
    <Card>
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {denominations.map((denom) => (
            <div
              key={denom.value}
              className="grid grid-cols-4 gap-4 items-center py-2 border-b last:border-0"
            >
              <div className="col-span-1 text-right">
                <span className="text-green-700 font-semibold">
                  ${denom.value.toFixed(2)}
                </span>
              </div>
              <div className="col-span-1 text-center text-gray-600 text-sm">
                ({denom.quantity > 0 ? denom.quantity : 0})
              </div>
              <div className="col-span-1">
                <Input
                  type="number"
                  min="0"
                  value={denom.quantity || ""}
                  onChange={(e) =>
                    onQuantityChange(denom.value, parseInt(e.target.value) || 0)
                  }
                  className="text-center"
                  placeholder="0"
                />
              </div>
              <div className="col-span-1 text-right text-gray-600 text-sm">
                ({denom.total.toFixed(2)})
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CashDenominationsSectionProps {
  bills: Denomination[];
  coins: Denomination[];
  onBillQuantityChange: (value: number, quantity: number) => void;
  onCoinQuantityChange: (value: number, quantity: number) => void;
  transactionTotal: number;
  cashTotal: number;
  onReset: () => void;
  onAccept: () => void;
}

export function CashDenominationsSection({
  bills,
  coins,
  onBillQuantityChange,
  onCoinQuantityChange,
  transactionTotal,
  cashTotal,
  onReset,
  onAccept,
}: CashDenominationsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Bills and Coins Grid */}
      <div className="grid grid-cols-2 gap-4">
        <DenominationEntry
          denominations={bills}
          onQuantityChange={onBillQuantityChange}
          title="Billetes"
          type="bills"
        />
        <DenominationEntry
          denominations={coins}
          onQuantityChange={onCoinQuantityChange}
          title="Monedas"
          type="coins"
        />
      </div>

      {/* Transaction Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                Monto de la transacción:
              </span>
              <span className="text-gray-900 font-semibold text-lg">
                ${transactionTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total de efectivo:</span>
              <span className="text-gray-900 font-semibold text-lg">
                ${cashTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Regresar
        </Button>
        <Button type="submit" onClick={onAccept} className="bg-blue-600 hover:bg-blue-700">
          Aceptar
        </Button>
      </div>
    </div>
  );
}
