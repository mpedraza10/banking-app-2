"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, DollarSign, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import type { CreditLimitStatus } from "@/lib/actions/diestel";

interface CreditManagementProps {
  creditStatus: CreditLimitStatus | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function CreditManagement({ creditStatus, onRefresh, isLoading }: CreditManagementProps) {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Component initialization
  }, []);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  if (!creditStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Management</CardTitle>
          <CardDescription>Credit limit information not available</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Process a credit check to view credit limit status
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalCreditPercentage = (creditStatus.totalCreditUsed / creditStatus.creditLimit) * 100;
  const dailyUsagePercentage = (creditStatus.dailyUsed / creditStatus.dailyLimit) * 100;

  const getCreditStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-orange-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getCreditStatusBadge = () => {
    if (totalCreditPercentage >= 90) {
      return <Badge variant="destructive">Critical</Badge>;
    }
    if (totalCreditPercentage >= 75) {
      return <Badge variant="outline" className="border-orange-600 text-orange-600">Warning</Badge>;
    }
    if (totalCreditPercentage >= 50) {
      return <Badge variant="outline" className="border-yellow-600 text-yellow-600">Moderate</Badge>;
    }
    return <Badge variant="outline" className="border-green-600 text-green-600">Good</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Credit Management
              {getCreditStatusBadge()}
            </CardTitle>
            <CardDescription>
              Monitor Diestel credit limits and usage
            </CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status Alert */}
        {!creditStatus.canProcess && creditStatus.message && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{creditStatus.message}</AlertDescription>
          </Alert>
        )}

        {creditStatus.canProcess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Credit available. You can process transactions within limits.
            </AlertDescription>
          </Alert>
        )}

        {/* Total Credit Limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Total Credit Limit</span>
            </div>
            <span className={`text-sm font-medium ${getCreditStatusColor(totalCreditPercentage)}`}>
              {totalCreditPercentage.toFixed(1)}% used
            </span>
          </div>
          <Progress value={totalCreditPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Used: ${creditStatus.totalCreditUsed.toLocaleString()}</span>
            <span>Limit: ${creditStatus.creditLimit.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-600">
              Available: ${creditStatus.remainingCredit.toLocaleString()}
            </span>
          </div>
        </div>

        <Separator />

        {/* Daily Limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Daily Limit</span>
            </div>
            <span className={`text-sm font-medium ${getCreditStatusColor(dailyUsagePercentage)}`}>
              {dailyUsagePercentage.toFixed(1)}% used
            </span>
          </div>
          <Progress value={dailyUsagePercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Used Today: ${creditStatus.dailyUsed.toLocaleString()}</span>
            <span>Daily Cap: ${creditStatus.dailyLimit.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-600">
              Available Today: ${creditStatus.remainingDailyLimit.toLocaleString()}
            </span>
          </div>
        </div>

        <Separator />

        {/* Credit Summary Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold">${creditStatus.creditLimit.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Daily Cap Range</p>
            <p className="text-2xl font-bold">$6K - $8K</p>
          </div>
        </div>

        {/* Warning Thresholds Info */}
        <Alert>
          <AlertDescription className="text-xs">
            <strong>Credit Monitoring:</strong> System alerts when usage exceeds 75% of limits.
            Critical alerts at 90%+. Daily limits reset at midnight.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
