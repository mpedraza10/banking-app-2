"use client";

import { useState } from "react";
import { CustomerDetailDisplay } from "@/components/customers/customer-detail-display";
import { CustomerSearchForm } from "@/components/customers/customer-search-form";
import { CustomerSelectionTable } from "@/components/customers/customer-selection-table";
import { ProtectedRoute } from "@/components/protected-route";
import type { CustomerSearchResult } from "@/lib/actions/customers";


type ViewState = "search" | "selection" | "detail";

export default function CustomerSearchPage() {
  const [currentView, setCurrentView] = useState<ViewState>("search");
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>(
    []
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const handleSearchComplete = (results: CustomerSearchResult[]) => {
    setSearchResults(results);
    if (results.length === 0) {
      setCurrentView("search");
      setSelectedCustomerId("");
      return;
    }

    setCurrentView("selection");
    setSelectedCustomerId("");
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentView("detail");
  };

  const handleBackToSearch = () => {
    setCurrentView("search");
    setSearchResults([]);
    setSelectedCustomerId("");
  };

  const handleBackToSelection = () => {
    setCurrentView("selection");
    setSelectedCustomerId("");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">
                Caja Corporativa
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Caja bancaria</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tu cuenta</span>
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Dropdown arrow"
                >
                  <title>Dropdown arrow</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 flex-1">
          {currentView === "search" && (
            <div>
              <h1 className="text-2xl font-normal text-gray-800 mb-6">
                Búsqueda de cliente
              </h1>
              <CustomerSearchForm
                onSearchComplete={handleSearchComplete}
                onReset={handleBackToSearch}
              />
            </div>
          )}

          {currentView === "selection" && (
            <CustomerSelectionTable
              customers={searchResults}
              onSelectCustomer={handleSelectCustomer}
              onBack={handleBackToSearch}
            />
          )}

          {currentView === "detail" && selectedCustomerId && (
            <CustomerDetailDisplay
              customerId={selectedCustomerId}
              onBack={handleBackToSelection}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto">
          <div className="container mx-auto px-4 py-4 text-center">
            <p className="text-sm text-gray-600">
              Copyright © 2018 Grupo Famsa S.A.B. de C.V.
            </p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
