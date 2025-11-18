"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserCircle } from "lucide-react";

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0"
            aria-label="Go to dashboard"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">CC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Caja Cooperativa
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Gestión de Cajeros
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <UserCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.email || "Usuario"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

