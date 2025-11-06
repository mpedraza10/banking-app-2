"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { getPendingSPEITransfers } from "@/lib/actions/diestel";
import { Calendar as CalendarIcon, Download, RefreshCw, Send, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function SPEISchedulingPage() {
  return (
    <ProtectedRoute>
      <SPEISchedulingContent />
    </ProtectedRoute>
  );
}

function SPEISchedulingContent() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [speiData, setSpeiData] = useState<{
    scheduledDate: Date;
    payments: Array<{
      id: string;
      referenceNumber: string;
      paymentAmount: string;
      createdAt: Date;
      status: string;
    }>;
    totalAmount: number;
    transactionCount: number;
    bbvaAccount: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSPEITransfers = useCallback(async (date: Date) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await getPendingSPEITransfers(user, date);
      setSpeiData(data);

      if (data.transactionCount === 0) {
        toast.info("No Diestel payments found for selected date");
      } else {
        toast.success(`Loaded ${data.transactionCount} payment(s)`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load SPEI transfers");
      setSpeiData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadSPEITransfers(selectedDate);
  }, [selectedDate, loadSPEITransfers]);

  const handleRefresh = () => {
    loadSPEITransfers(selectedDate);
  };

  const handleExportToFile = () => {
    if (!speiData || !speiData.payments || speiData.payments.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create SPEI file format (simplified example)
    const fileContent = [
      `SPEI Transfer File - ${format(selectedDate, "yyyy-MM-dd")}`,
      `BBVA Account: [To be configured]`,
      `Total Amount: $${speiData.totalAmount.toFixed(2)}`,
      `Transaction Count: ${speiData.transactionCount}`,
      "",
      "Transactions:",
      ...speiData.payments.map(
        (payment, index: number) =>
          `${index + 1}. Ref: ${payment.referenceNumber} | Amount: ${parseFloat(payment.paymentAmount).toFixed(2)} | Date: ${format(new Date(payment.createdAt), "yyyy-MM-dd HH:mm:ss")}`
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SPEI_Diestel_${format(selectedDate, "yyyyMMdd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("SPEI file exported successfully");
  };

  const handleProcessSPEI = () => {
    // Placeholder for SPEI processing integration
    toast.info("SPEI processing integration pending - This would trigger the bank transfer");
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SPEI Payment Scheduling</h1>
          <p className="text-muted-foreground">
            Schedule and manage daily SPEI transfers for Diestel payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Selection and Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date Picker Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select Transfer Date</CardTitle>
            <CardDescription>Choose a date to view scheduled transfers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                SPEI transfers are processed once daily. Select a date to view all Diestel payments
                for that day.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Summary</CardTitle>
            <CardDescription>Scheduled transfer details for selected date</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </div>
            ) : speiData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction Count</p>
                    <p className="text-2xl font-bold">{speiData.transactionCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">${speiData.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Destination Account</p>
                  <p className="font-medium">{speiData.bbvaAccount}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transfer Status</p>
                  <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                    Pending
                  </Badge>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription>No data available. Select a date to load transfers.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      {speiData && speiData.payments && speiData.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Transactions</CardTitle>
            <CardDescription>
              {speiData.transactionCount} Diestel payment(s) scheduled for SPEI transfer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                Total transfer amount: ${speiData.totalAmount.toFixed(2)}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Reference Number</TableHead>
                  <TableHead>Payment Amount</TableHead>
                  <TableHead>Transaction Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {speiData.payments.map((payment, index: number) => (
                  <TableRow key={payment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{payment.referenceNumber}</TableCell>
                    <TableCell className="font-semibold">
                      ${parseFloat(payment.paymentAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>{format(new Date(payment.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {speiData && speiData.payments && speiData.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Actions</CardTitle>
            <CardDescription>Export or process scheduled SPEI transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportToFile}>
                <Download className="mr-2 h-4 w-4" />
                Export to File
              </Button>
              <Button onClick={handleProcessSPEI}>
                <Send className="mr-2 h-4 w-4" />
                Process SPEI Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>SPEI Processing:</strong> All Diestel payments for a given day are grouped into a
          single SPEI transfer to the configured BBVA account. Transfers are typically processed at
          end of business day. Export functionality generates a transfer file in the required format.
        </AlertDescription>
      </Alert>
    </div>
  );
}
