"use client";

import React, { useRef } from "react";
import { ReceiptTemplate } from "./receipt-template";
import type { ReceiptData } from "@/lib/actions/receipts";

interface ReceiptPrinterProps {
  receipt: ReceiptData;
  onAfterPrint?: () => void;
  isReprint?: boolean;
  children?: (handlePrint: () => void) => React.ReactNode;
}

export function ReceiptPrinter({
  receipt,
  onAfterPrint,
  isReprint = false,
  children,
}: ReceiptPrinterProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    if (onAfterPrint) {
      setTimeout(() => {
        onAfterPrint();
      }, 500);
    }
  };

  if (children) {
    return (
      <>
        {children(handlePrint)}
        <div className="print:block hidden">
          <ReceiptTemplate receipt={receipt} isReprint={isReprint} />
        </div>
      </>
    );
  }

  return (
    <div>
      <div ref={componentRef}>
        <ReceiptTemplate
          receipt={receipt}
          onPrint={handlePrint}
          isReprint={isReprint}
        />
      </div>
    </div>
  );
}
