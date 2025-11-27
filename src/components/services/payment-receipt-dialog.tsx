"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useRef } from "react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

interface PaymentReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: {
    transactionNumber: string;
    serviceName: string;
    referenceNumber: string;
    amount: number;
    commission: number;
    total: number;
    date: Date;
    authorizationCode?: string;
    cashReceived?: number;
    changeAmount?: number;
  } | null;
}

export function PaymentReceiptDialog({
  open,
  onOpenChange,
  paymentData,
}: PaymentReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!paymentData) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printContents = printContent.innerHTML;
      
      // Create a print window or iframe would be better, but for simplicity in this environment:
      // We'll use a print-specific style block
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
      
      window.print();
      
      document.head.removeChild(style);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
        </DialogHeader>
        
        <div id="receipt-content" ref={receiptRef} className="p-4 border rounded-md bg-white space-y-4">
          <div className="text-center border-b pb-4">
            <h3 className="font-bold text-lg">Banco Famsa</h3>
            <p className="text-sm text-gray-500">Comprobante de Pago de Servicios</p>
            <p className="text-xs text-gray-400 mt-1">{paymentData.date.toLocaleString()}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transacción:</span>
              <span className="font-mono font-medium">{paymentData.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium">{paymentData.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Referencia:</span>
              <span className="font-mono">{paymentData.referenceNumber}</span>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Importe:</span>
                <span>{formatCurrency(paymentData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Comisión:</span>
                <span>{formatCurrency(paymentData.commission)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total:</span>
                <span>{formatCurrency(paymentData.total)}</span>
              </div>
              {paymentData.cashReceived !== undefined && (
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="text-gray-600">Efectivo Recibido:</span>
                  <span>{formatCurrency(paymentData.cashReceived)}</span>
                </div>
              )}
              {paymentData.changeAmount !== undefined && paymentData.changeAmount > 0 && (
                <div className="flex justify-between font-bold text-orange-600">
                  <span>Cambio:</span>
                  <span>{formatCurrency(paymentData.changeAmount)}</span>
                </div>
              )}
            </div>
            
            {paymentData.authorizationCode && (
              <div className="text-center pt-4">
                <p className="text-xs text-gray-500">Autorización</p>
                <p className="font-mono font-bold">{paymentData.authorizationCode}</p>
              </div>
            )}
          </div>
          
          <div className="text-center text-xs text-gray-400 pt-4 border-t">
            <p>Gracias por su preferencia</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Reimprimir
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir Comprobante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
