"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionConfirmation } from "@/components/transactions/transaction-confirmation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getTransactionById } from "@/lib/actions/transactions";
import { getReceiptByTransactionId } from "@/lib/actions/receipts";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TransactionDetail } from "@/lib/actions/transactions";
import type { ReceiptData } from "@/lib/actions/receipts";

function TransactionConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transactionId = searchParams.get("id");

  useEffect(() => {
    const loadTransaction = async () => {
      if (!user || !transactionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load transaction
        const txn = await getTransactionById(user, transactionId);
        if (!txn) {
          setError("Transacción no encontrada");
          return;
        }
        setTransaction(txn);

        // Load receipt if exists
        try {
          const rcpt = await getReceiptByTransactionId(user, transactionId);
          setReceipt(rcpt);
        } catch (receiptError) {
          // Receipt might not exist yet, that's okay
        }
      } catch (err) {
        console.error("Error loading transaction:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar la transacción"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [user, transactionId]);

  const handleNewTransaction = () => {
    router.push("/");
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "No se pudo cargar la transacción"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TransactionConfirmation
      transaction={transaction}
      receipt={receipt || undefined}
      onClose={handleClose}
      onNewTransaction={handleNewTransaction}
    />
  );
}

export default function TransactionConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <TransactionConfirmationContent />
    </Suspense>
  );
}
