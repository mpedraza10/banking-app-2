"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCashDrawerBalance } from "@/lib/actions/denominations";
import { useAuth } from "@/lib/hooks/useAuth";
import { AVAILABLE_DENOMINATIONS } from "@/lib/actions/denominations";

interface ReconciliationData {
  denomination: number;
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
  expectedAmount: number;
  actualAmount: number;
  differenceAmount: number;
}

interface CashReconciliationProps {
  userId: string;
  expectedBalance?: Record<number, number>; // Expected quantities per denomination
  onComplete?: (reconciliationData: ReconciliationData[]) => void;
}

export function CashReconciliation({
  userId,
  expectedBalance = {},
  onComplete,
}: CashReconciliationProps) {
  const { user } = useAuth();
  const [isReconciling, setIsReconciling] = useState(false);

  const {
    data: actualBalance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cashDrawer", userId],
    queryFn: () => getCashDrawerBalance(user, userId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reconciliación de Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar datos de reconciliación: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Create actual balance lookup map
  const actualBalanceMap = new Map(
    actualBalance?.map((item) => [item.denomination, item]) || []
  );

  // Build reconciliation data
  const reconciliationData: ReconciliationData[] = AVAILABLE_DENOMINATIONS.map(
    (denomination) => {
      const expected = expectedBalance[denomination] || 0;
      const actual = actualBalanceMap.get(denomination)?.quantity || 0;
      const difference = actual - expected;

      return {
        denomination,
        expectedQuantity: expected,
        actualQuantity: actual,
        difference,
        expectedAmount: denomination * expected,
        actualAmount: denomination * actual,
        differenceAmount: denomination * difference,
      };
    }
  );

  // Calculate totals
  const totalExpected = reconciliationData.reduce(
    (sum, item) => sum + item.expectedAmount,
    0
  );
  const totalActual = reconciliationData.reduce(
    (sum, item) => sum + item.actualAmount,
    0
  );
  const totalDifference = totalActual - totalExpected;

  const hasDiscrepancies = Math.abs(totalDifference) > 0.01;

  const handleReconcile = () => {
    setIsReconciling(true);
    if (onComplete) {
      onComplete(reconciliationData);
    }
    setIsReconciling(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reconciliación de Caja - Fin de Día</span>
          <span className="text-sm text-gray-600">
            Usuario: {userId}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Alert */}
        {hasDiscrepancies ? (
          <Alert variant="destructive">
            <AlertDescription>
              Se detectaron diferencias en el conteo de caja. Revisa el detalle
              a continuación.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              El conteo de caja coincide con lo esperado.
            </AlertDescription>
          </Alert>
        )}

        {/* Reconciliation Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold">Denominación</TableHead>
                <TableHead className="text-center font-semibold">
                  Esperado
                </TableHead>
                <TableHead className="text-center font-semibold">
                  Real
                </TableHead>
                <TableHead className="text-center font-semibold">
                  Diferencia
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Monto Esperado
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Monto Real
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Diferencia ($)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reconciliationData.map((item) => {
                const hasDifference = Math.abs(item.difference) > 0;

                return (
                  <TableRow
                    key={item.denomination}
                    className={hasDifference ? "bg-red-50" : ""}
                  >
                    <TableCell className="font-medium">
                      ${item.denomination.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.expectedQuantity}
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        hasDifference ? "font-semibold text-red-700" : ""
                      }`}
                    >
                      {item.actualQuantity}
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        hasDifference ? "font-semibold text-red-700" : ""
                      }`}
                    >
                      {item.difference > 0 ? "+" : ""}
                      {item.difference}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.expectedAmount.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        hasDifference ? "font-semibold text-red-700" : ""
                      }`}
                    >
                      ${item.actualAmount.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        hasDifference ? "font-semibold text-red-700" : ""
                      }`}
                    >
                      {item.differenceAmount > 0 ? "+" : ""}$
                      {item.differenceAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Totals Row */}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-center">
                  {reconciliationData.reduce(
                    (sum, item) => sum + item.expectedQuantity,
                    0
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {reconciliationData.reduce(
                    (sum, item) => sum + item.actualQuantity,
                    0
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {reconciliationData.reduce(
                    (sum, item) => sum + item.difference,
                    0
                  )}
                </TableCell>
                <TableCell className="text-right">
                  ${totalExpected.toFixed(2)}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    hasDiscrepancies ? "text-red-700" : ""
                  }`}
                >
                  ${totalActual.toFixed(2)}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    hasDiscrepancies ? "text-red-700" : ""
                  }`}
                >
                  {totalDifference > 0 ? "+" : ""}${totalDifference.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Total esperado: ${totalExpected.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              Total real: ${totalActual.toFixed(2)}
            </p>
            <p
              className={`text-sm font-semibold ${
                hasDiscrepancies ? "text-red-700" : "text-green-700"
              }`}
            >
              Diferencia: {totalDifference > 0 ? "+" : ""}$
              {totalDifference.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleReconcile}
              disabled={isReconciling}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isReconciling ? "Procesando..." : "Completar Reconciliación"}
            </Button>
          </div>
        </div>

        {/* Notes Section */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>Nota:</strong> La reconciliación de caja debe realizarse al
            final de cada turno. Las diferencias deben ser documentadas y
            reportadas al supervisor.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
