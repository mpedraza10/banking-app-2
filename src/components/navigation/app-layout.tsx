"use client";

import React from "react";
import { AppNavigation } from "./app-navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppNavigation />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
