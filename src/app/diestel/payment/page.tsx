"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CashDenominationsSection } from "@/components/services/cash-denominations-section";
import { toast } from "sonner";
import {
  processDiestelPayment,
  checkDiestelCreditLimit,
  getDiestelStatistics,
} from "@/lib/actions/diestel";
import { AlertCircle, CheckCircle2, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import type { CreditLimitStatus } from "@/lib/actions/diestel";

export default function DiestelPaymentPage() {
  return (
    <ProtectedRoute>
      <DiestelPaymentContent />
    </ProtectedRoute>
  );
}

function DiestelPaymentContent() {
  const { user } = useAuth();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [bills, setBills] = useState<Array<{ value: number; quantity: number; total: number }>>([
    { value: 1000, quantity: 0, total: 0 },
    { value: 500, quantity: 0, total: 0 },
    { value: 200, quantity: 0, total: 0 },
    { value: 100, quantity: 0, total: 0 },
    { value: 50, quantity: 0, total: 0 },
    { value: 20, quantity: 0, total: 0 },
  ]);
  const [coins, setCoins] = useState<Array<{ value: number; quantity: number; total: number }>>([
    { value: 10, quantity: 0, total: 0 },
    { value: 5, quantity: 0, total: 0 },
    { value: 2, quantity: 0, total: 0 },
    { value: 1, quantity: 0, total: 0 },
    { value: 0.5, quantity: 0, total: 0 },
  ]);
  const [creditStatus, setCreditStatus] = useState<CreditLimitStatus | null>(null);
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statistics, setStatistics] = useState<{
    totalPayments: { count: number; amount: number };
    todayPayments: { count: number; amount: number };
    creditStatus: CreditLimitStatus;
  } | null>(null);

  // Format reference number with dashes for readability (XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX)
  const formatReference = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 6) {
      parts.push(cleaned.slice(i, i + 6));
    }
    return parts.join("-");
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatReference(e.target.value);
    if (formatted.replace(/-/g, "").length <= 30) {
      setReferenceNumber(formatted);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setPaymentAmount(value);
      // Clear credit status when amount changes
      setCreditStatus(null);
    }
  };

  const handleCheckCredit = async () => {
    if (!user) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    setIsCheckingCredit(true);
    try {
      const status = await checkDiestelCreditLimit(user, amount);
      setCreditStatus(status);

      if (status.canProcess) {
        toast.success("Credit available for this transaction");
      } else {
        toast.error(status.message || "Credit limit exceeded");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check credit limit");
    } finally {
      setIsCheckingCredit(false);
    }
  };

  const handleLoadStatistics = async () => {
    if (!user) return;

    try {
      const stats = await getDiestelStatistics(user);
      setStatistics(stats);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load statistics");
    }
  };

  const handleProcessPayment = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Validate reference
    const cleanReference = referenceNumber.replace(/-/g, "");
    if (cleanReference.length !== 30) {
      toast.error("Reference number must be exactly 30 digits");
      return;
    }

    // Validate amount
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    // Validate denominations
    const totalFromDenominations = [...bills, ...coins].reduce(
      (sum, denom) => sum + denom.total,
      0
    );

    if (Math.abs(totalFromDenominations - amount) > 0.01) {
      toast.error(
        `Cash denominations ($${totalFromDenominations.toFixed(2)}) must match payment amount ($${amount.toFixed(2)})`
      );
      return;
    }

    // Check credit if not already checked
    if (!creditStatus) {
      toast.error("Please check credit limit before processing");
      return;
    }

    if (!creditStatus.canProcess) {
      toast.error("Cannot process payment: Credit limit validation failed");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processDiestelPayment(user, {
        referenceNumber: cleanReference,
        paymentAmount: amount,
        userId: user.id,
        branchId: "default-branch", // TODO: Get from user session
      });

      toast.success(result.message || "Diestel payment processed successfully");

      // Reset form
      setReferenceNumber("");
      setPaymentAmount("");
      setBills(bills.map(b => ({ ...b, quantity: 0, total: 0 })));
      setCoins(coins.map(c => ({ ...c, quantity: 0, total: 0 })));
      setCreditStatus(null);

      // Reload statistics
      handleLoadStatistics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diestel Payment</h1>
          <p className="text-muted-foreground">Process Diestel service payments with credit validation</p>
        </div>
        <Button variant="outline" onClick={handleLoadStatistics}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Load Statistics
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credit Used</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statistics.creditStatus.totalCreditUsed.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                of ${statistics.creditStatus.creditLimit.toFixed(2)} limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statistics.todayPayments.amount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.todayPayments.count} payment(s) today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statistics.creditStatus.remainingCredit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Daily: ${statistics.creditStatus.remainingDailyLimit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Diestel Payment Details</CardTitle>
          <CardDescription>
            Enter 30-digit reference number and payment amount. Credit validation required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number (30 digits)</Label>
            <Input
              id="reference"
              placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX"
              value={referenceNumber}
              onChange={handleReferenceChange}
              maxLength={34} // 30 digits + 4 dashes
            />
            <p className="text-sm text-muted-foreground">
              {referenceNumber.replace(/-/g, "").length}/30 digits
            </p>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (MXN)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="text"
                placeholder="0.00"
                value={paymentAmount}
                onChange={handleAmountChange}
                className="flex-1"
              />
              <Button onClick={handleCheckCredit} disabled={isCheckingCredit} variant="outline">
                {isCheckingCredit ? "Checking..." : "Check Credit"}
              </Button>
            </div>
          </div>

          {/* Credit Status Display */}
          {creditStatus && (
            <Alert variant={creditStatus.canProcess ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {creditStatus.canProcess ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <div className="flex-1 space-y-2">
                  <AlertDescription>
                    {creditStatus.canProcess
                      ? "Credit available for this transaction"
                      : creditStatus.message}
                  </AlertDescription>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Total Credit</p>
                      <p>
                        ${creditStatus.remainingCredit.toFixed(2)} / $
                        {creditStatus.creditLimit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Daily Limit</p>
                      <p>
                        ${creditStatus.remainingDailyLimit.toFixed(2)} / $
                        {creditStatus.dailyLimit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Alert>
          )}

          <Separator />

          {/* Cash Denominations */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Cash Denominations</h3>
            <CashDenominationsSection
              bills={bills}
              coins={coins}
              onBillQuantityChange={(value, quantity) => {
                setBills(bills.map(b => 
                  b.value === value 
                    ? { ...b, quantity, total: value * quantity }
                    : b
                ));
              }}
              onCoinQuantityChange={(value, quantity) => {
                setCoins(coins.map(c => 
                  c.value === value 
                    ? { ...c, quantity, total: value * quantity }
                    : c
                ));
              }}
              transactionTotal={parseFloat(paymentAmount) || 0}
              cashTotal={[...bills, ...coins].reduce((sum, d) => sum + d.total, 0)}
              onReset={() => {
                setBills(bills.map(b => ({ ...b, quantity: 0, total: 0 })));
                setCoins(coins.map(c => ({ ...c, quantity: 0, total: 0 })));
              }}
              onAccept={() => {}}
            />
          </div>

          {/* Process Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReferenceNumber("");
                setPaymentAmount("");
                setBills(bills.map(b => ({ ...b, quantity: 0, total: 0 })));
                setCoins(coins.map(c => ({ ...c, quantity: 0, total: 0 })));
                setCreditStatus(null);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={
                isProcessing ||
                !creditStatus?.canProcess ||
                referenceNumber.replace(/-/g, "").length !== 30
              }
            >
              {isProcessing ? "Processing..." : "Process Diestel Payment"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Diestel payments have a total credit limit of $100,000 MXN
          with daily caps between $6,000-$8,000 MXN. All payments are scheduled for daily SPEI
          transfers to the configured BBVA account. No commission is charged for Diestel payments.
        </AlertDescription>
      </Alert>
    </div>
  );
}
