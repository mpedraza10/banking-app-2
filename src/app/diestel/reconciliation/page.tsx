"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  searchDiestelTransaction,
  processDiestelReconciliationFile,
  getReconciliationReport,
  generateReconciliationSummary,
} from "@/lib/actions/diestel-reconciliation";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Search,
  Upload,
  XCircle,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import type { ReconciliationRecord, ReconciliationSummary } from "@/lib/actions/diestel-reconciliation";

export default function DiestelReconciliationPage() {
  return (
    <ProtectedRoute>
      <DiestelReconciliationContent />
    </ProtectedRoute>
  );
}

function DiestelReconciliationContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("search");

  // Search tab state
  const [searchReference, setSearchReference] = useState("");
  const [searchResult, setSearchResult] = useState<{
    id: string;
    referenceNumber: string;
    paymentAmount: number;
    transactionDate: Date;
    status: string;
    customerId?: string | null;
    userId: string;
    notFound?: boolean;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // File upload tab state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reconciliationRecords, setReconciliationRecords] = useState<ReconciliationRecord[]>([]);
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummary | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Report tab state
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportData, setReportData] = useState<{
    startDate: Date;
    endDate: Date;
    records: ReconciliationRecord[];
    summary: ReconciliationSummary;
  } | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleSearch = async () => {
    if (!user) return;

    const cleanReference = searchReference.replace(/[\s-]/g, "");
    if (cleanReference.length !== 30) {
      toast.error("Reference must be exactly 30 digits");
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const result = await searchDiestelTransaction(user, cleanReference);

      if (!result) {
        toast.error("Transaction not found");
        setSearchResult({ 
          id: "",
          referenceNumber: cleanReference,
          paymentAmount: 0,
          transactionDate: new Date(),
          status: "",
          userId: "",
          notFound: true 
        });
      } else {
        setSearchResult({
          ...result,
          customerId: result.customerId || undefined,
        });
        toast.success("Transaction found");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".txt") && !file.name.endsWith(".csv")) {
        toast.error("Please select a .txt or .csv file");
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleProcessFile = async () => {
    if (!user || !selectedFile) return;

    setIsProcessing(true);
    try {
      const fileContent = await selectedFile.text();
      const records = await processDiestelReconciliationFile(user, fileContent);
      const summary = await generateReconciliationSummary(user, records);

      setReconciliationRecords(records);
      setReconciliationSummary(summary);

      toast.success(`Processed ${records.length} records from file`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadReport = async () => {
    if (!user) return;

    if (!reportStartDate || !reportEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsLoadingReport(true);
    try {
      const startDate = new Date(reportStartDate);
      const endDate = new Date(reportEndDate);
      endDate.setHours(23, 59, 59, 999);

      const report = await getReconciliationReport(user, startDate, endDate);
      setReportData(report);

      toast.success(`Loaded ${report.records.length} transactions`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load report");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case "Matched":
        return (
          <Badge variant="outline" className="border-green-600 text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Matched
          </Badge>
        );
      case "Discrepancy":
        return (
          <Badge variant="outline" className="border-orange-600 text-orange-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            Discrepancy
          </Badge>
        );
      case "Not Found":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Not Found
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleExportReport = () => {
    if (!reportData) return;

    const csvContent = [
      "Transaction ID,Reference Number,Payment Amount,Transaction Date,Status",
      ...reportData.records.map((record: ReconciliationRecord) =>
        [
          record.transactionId,
          record.referenceNumber,
          record.paymentAmount.toFixed(2),
          format(new Date(record.transactionDate), "yyyy-MM-dd HH:mm:ss"),
          record.matchStatus,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Diestel_Reconciliation_${format(new Date(), "yyyyMMdd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Report exported successfully");
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Diestel Reconciliation</h1>
        <p className="text-muted-foreground">
          Match transactions with Diestel files and generate reconciliation reports
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Transaction Search</TabsTrigger>
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="report">Reports</TabsTrigger>
        </TabsList>

        {/* Transaction Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Transaction</CardTitle>
              <CardDescription>
                Search for Diestel transactions by reference number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="search-ref">Reference Number (30 digits)</Label>
                  <Input
                    id="search-ref"
                    placeholder="Enter 30-digit reference"
                    value={searchReference}
                    onChange={(e) => setSearchReference(e.target.value)}
                    maxLength={35}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={isSearching}>
                    <Search className="mr-2 h-4 w-4" />
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {searchResult && (
                <>
                  <Separator />
                  {searchResult.notFound ? (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Transaction not found for reference: {searchReference}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-2">
                      <Alert>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription>Transaction found successfully</AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Transaction ID</p>
                          <p className="font-mono">{searchResult.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Reference Number</p>
                          <p className="font-mono">{searchResult.referenceNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Amount</p>
                          <p className="text-lg font-bold">
                            ${searchResult.paymentAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Transaction Date</p>
                          <p>{format(new Date(searchResult.transactionDate), "PPP")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge>{searchResult.status}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Upload Tab */}
        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Diestel File</CardTitle>
              <CardDescription>
                Upload reconciliation file from Diestel for automatic matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File (.txt or .csv)</Label>
                <div className="flex gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileChange}
                  />
                  <Button
                    onClick={handleProcessFile}
                    disabled={!selectedFile || isProcessing}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isProcessing ? "Processing..." : "Process"}
                  </Button>
                </div>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Reconciliation Summary */}
          {reconciliationSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{reconciliationSummary.totalTransactions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Matched</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reconciliationSummary.matchedTransactions}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Discrepancies</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {reconciliationSummary.discrepancyTransactions}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Match Rate</p>
                    <p className="text-2xl font-bold">
                      {reconciliationSummary.reconciliationRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reconciliation Records Table */}
          {reconciliationRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>System Amount</TableHead>
                      <TableHead>File Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reconciliationRecords.map((record) => (
                      <TableRow key={record.referenceNumber}>
                        <TableCell className="font-mono text-sm">
                          {record.referenceNumber}
                        </TableCell>
                        <TableCell>${record.paymentAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {record.diestelFileAmount
                            ? `$${record.diestelFileAmount.toFixed(2)}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getMatchStatusBadge(record.matchStatus)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reconciliation Report</CardTitle>
              <CardDescription>
                Select date range to generate reconciliation report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLoadReport} disabled={isLoadingReport}>
                  <FileText className="mr-2 h-4 w-4" />
                  {isLoadingReport ? "Loading..." : "Generate Report"}
                </Button>
                {reportData && (
                  <Button variant="outline" onClick={handleExportReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {reportData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <CardDescription>
                    {format(new Date(reportData.startDate), "PP")} -{" "}
                    {format(new Date(reportData.endDate), "PP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-2xl font-bold">
                        {reportData.summary.totalTransactions}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">
                        ${reportData.summary.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Reconciliation</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {reportData.summary.pendingTransactions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>
                      {reportData.records.length} transaction(s) in selected period
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.records.map((record: ReconciliationRecord) => (
                        <TableRow key={record.transactionId}>
                          <TableCell className="font-mono text-sm">
                            {record.transactionId.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {record.referenceNumber}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${record.paymentAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(record.transactionDate), "yyyy-MM-dd HH:mm")}
                          </TableCell>
                          <TableCell>{getMatchStatusBadge(record.matchStatus)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Reconciliation Process:</strong> Use transaction search for individual lookups,
          file upload for batch reconciliation with Diestel files, and reports for period analysis.
          All discrepancies should be investigated and resolved promptly.
        </AlertDescription>
      </Alert>
    </div>
  );
}
