"use client";

import { useState } from "react";
import { CustomerDetailDisplay } from "@/components/customers/customer-detail-display";
import { CustomerSearchForm } from "@/components/customers/customer-search-form";
import { CustomerSelectionTable } from "@/components/customers/customer-selection-table";
import { ProtectedRoute } from "@/components/protected-route";
import type { CustomerSearchResult } from "@/lib/actions/customers";

// Helper function to get initial state from sessionStorage (called once)
function getInitialState(): { view: "search" | "selection" | "detail"; customerId: string } {
  if (typeof window === "undefined") {
    return { view: "search", customerId: "" };
  }
  const preSelectedCustomerId = sessionStorage.getItem("preSelectedCustomerId");
  if (preSelectedCustomerId) {
    sessionStorage.removeItem("preSelectedCustomerId");
    return { view: "detail", customerId: preSelectedCustomerId };
  }
  return { view: "search", customerId: "" };
}

type ViewState = "search" | "selection" | "detail";

export default function CustomerSearchPage() {
  // Get initial state once to avoid calling getInitialState() multiple times
  const [initialState] = useState(() => getInitialState());
  const [currentView, setCurrentView] = useState<ViewState>(initialState.view);
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>(
    []
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialState.customerId);

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
