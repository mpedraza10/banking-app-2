"use client";

import React from "react";
import { useSessionManagement } from "@/lib/hooks/useSessionManagement";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SessionManager() {
  const { showWarning, extendSession } = useSessionManagement();

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sesión por expirar</AlertDialogTitle>
          <AlertDialogDescription>
            Tu sesión está a punto de expirar debido a la inactividad. 
            ¿Deseas continuar trabajando?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={extendSession}>
            Continuar sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
