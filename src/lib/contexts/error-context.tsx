"use client";

import React, { createContext, useContext, useCallback, ReactNode } from "react";
import { toast } from "sonner";

interface ErrorContextType {
  handleError: (error: unknown, customMessage?: string) => void;
  handleSuccess: (message: string, description?: string) => void;
  handleInfo: (message: string, description?: string) => void;
  handleWarning: (message: string, description?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error("Application error:", error);

    const errorMessage = customMessage || "Ha ocurrido un error";
    let errorDescription = "";

    // Handle different error types
    if (error instanceof Error) {
      errorDescription = error.message;
    } else if (typeof error === "string") {
      errorDescription = error;
    } else if (error && typeof error === "object") {
      // Handle API errors
      if ("message" in error && typeof error.message === "string") {
        errorDescription = error.message;
      } else {
        errorDescription = "Error desconocido";
      }
    }

    // Show toast notification
    toast.error(errorMessage, {
      description: errorDescription,
      duration: 5000,
    });
  }, []);

  const handleSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  }, []);

  const handleInfo = useCallback((message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  }, []);

  const handleWarning = useCallback((message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  }, []);

  const value: ErrorContextType = {
    handleError,
    handleSuccess,
    handleInfo,
    handleWarning,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

export function useErrorHandler() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useErrorHandler must be used within an ErrorProvider");
  }
  return context;
}

// Predefined error messages for common scenarios
export const ERROR_MESSAGES = {
  NETWORK: "Error de conexión. Por favor, verifica tu conexión a internet.",
  BACKEND_UNAVAILABLE: "El sistema backend no está disponible. Por favor, intenta más tarde.",
  VALIDATION: "Los datos ingresados no son válidos. Por favor, verifica e intenta nuevamente.",
  UNAUTHORIZED: "No tienes autorización para realizar esta acción.",
  NOT_FOUND: "No se encontró la información solicitada.",
  TIMEOUT: "La operación ha tardado demasiado tiempo. Por favor, intenta nuevamente.",
  GENERIC: "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_COMPLETED: "Transacción completada exitosamente",
  DATA_SAVED: "Datos guardados correctamente",
  CUSTOMER_UPDATED: "Se actualizó el Cliente correctamente",
  PAYMENT_PROCESSED: "Pago procesado exitosamente",
};

// Warning messages
export const WARNING_MESSAGES = {
  NO_SEARCH_RESULTS: "No hay información de búsqueda",
  EXPIRED_RECEIPT: "Recibo vencido",
  DENOMINATION_MISMATCH: "Total entrada de denominaciones no coincide",
  LOW_INVENTORY: "Inventario bajo en denominaciones",
};
