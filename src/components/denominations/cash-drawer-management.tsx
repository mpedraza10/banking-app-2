"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getCashDrawerBalance } from "@/lib/actions/denominations";
import { useAuth } from "@/lib/hooks/useAuth";
import { AVAILABLE_DENOMINATIONS } from "@/lib/actions/denominations";

interface CashDrawerManagementProps {
  userId: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export function CashDrawerManagement({
  userId,
  showRefresh = true,
  onRefresh,
}: CashDrawerManagementProps) {
  const { user } = useAuth();

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cashDrawer", userId],
    queryFn: () => getCashDrawerBalance(user, userId),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const handleRefresh = () => {
    refetch();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Caja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar inventario de caja: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Create balance lookup map
  const balanceMap = new Map(
    balance?.map((item) => [item.denomination, item]) || []
  );

  // Calculate totals
  const totalCash = balance?.reduce((sum, item) => sum + item.amount, 0) || 0;

  // Separate bills and coins
  const bills = AVAILABLE_DENOMINATIONS.filter((d) => d >= 20);
  const coins = AVAILABLE_DENOMINATIONS.filter((d) => d < 20);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de Caja</CardTitle>
        {showRefresh && (
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Actualizar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bills Section */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Billetes</h3>
          <div className="space-y-2">
            {bills.map((denomination) => {
              const item = balanceMap.get(denomination);
              const quantity = item?.quantity || 0;
              const amount = item?.amount || 0;

              return (
                <div
                  key={denomination}
                  className="flex items-center justify-between text-sm py-1 border-b"
                >
                  <span className="font-medium">
                    ${denomination.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      Cantidad: <span className="font-semibold">{quantity}</span>
                    </span>
                    <span className="text-gray-900 font-medium min-w-[80px] text-right">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coins Section */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Monedas</h3>
          <div className="space-y-2">
            {coins.map((denomination) => {
              const item = balanceMap.get(denomination);
              const quantity = item?.quantity || 0;
              const amount = item?.amount || 0;

              return (
                <div
                  key={denomination}
                  className="flex items-center justify-between text-sm py-1 border-b"
                >
                  <span className="font-medium">
                    ${denomination.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      Cantidad: <span className="font-semibold">{quantity}</span>
                    </span>
                    <span className="text-gray-900 font-medium min-w-[80px] text-right">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
          <span className="text-lg font-bold">Total en Caja:</span>
          <span className="text-lg font-bold text-green-700">
            ${totalCash.toFixed(2)}
          </span>
        </div>

        {/* Low Balance Warning */}
        {totalCash < 500 && (
          <Alert variant="destructive">
            <AlertDescription>
              Saldo bajo en caja. Considera solicitar cambio.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
