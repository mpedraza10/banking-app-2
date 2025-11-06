"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function useSessionManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    clearTimers();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during session timeout logout:", error);
    }
    toast.error("Tu sesión ha expirado por inactividad");
    router.push("/auth/login");
  }, [router, clearTimers]);

  const resetTimer = useCallback(() => {
    if (!user) return;

    clearTimers();
    setShowWarning(false);

    // Set warning timer (5 minutes before timeout)
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      toast.warning("Tu sesión expirará en 5 minutos por inactividad", {
        duration: 10000,
      });
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timer (30 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [user, clearTimers, handleLogout]);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    resetTimer();
    toast.success("Sesión extendida");
  }, [resetTimer]);

  useEffect(() => {
    if (!user) {
      clearTimers();
      return;
    }

    // Activity events to reset timer
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    const activityHandler = () => {
      resetTimer();
    };

    // Initialize timer after mount
    const initTimer = setTimeout(() => {
      resetTimer();
    }, 0);

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, activityHandler);
    });

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      events.forEach((event) => {
        window.removeEventListener(event, activityHandler);
      });
      clearTimers();
    };
  }, [user, resetTimer, clearTimers]);

  return {
    showWarning,
    extendSession,
    timeoutMinutes: INACTIVITY_TIMEOUT / 60000,
  };
}
