"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Search,
  CreditCard,
  Receipt,
  Coins,
  FileText,
  History,
  LayoutDashboard,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";

export function AppNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
      console.error(error);
    } else {
      toast.success("Sesión cerrada exitosamente");
      router.push("/auth/login");
    }
  };

  const navigationItems = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      label: "Búsqueda de Clientes",
      icon: Search,
      href: "/customers/search",
    },
    {
      label: "Pago de Servicios",
      icon: Receipt,
      href: "/services/payment",
    },
    {
      label: "Pago de Tarjetas",
      icon: CreditCard,
      href: "/cards/payment",
    },
    {
      label: "Pago Diestel",
      icon: FileText,
      href: "/diestel/payment",
    },
    {
      label: "Efectivo",
      icon: Coins,
      href: "/denominations/cash-received",
    },
    {
      label: "Historial",
      icon: History,
      href: "/transactions/reprint",
    },
    {
      label: "Auditoría",
      icon: LayoutDashboard,
      href: "/audit-trail",
    },
    {
      label: "Catálogo",
      icon: Settings,
      href: "/services/catalog",
    },
  ];

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section: Logo and Back Button */}
          <div className="flex items-center gap-3">
            {pathname !== "/dashboard" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-2"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline ml-1">Atrás</span>
              </Button>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CC</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Caja Cooperativa
                </h1>
              </div>
            </button>
          </div>

          {/* Right section: Navigation Menu and User */}
          <div className="flex items-center gap-2">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 mr-2">
              {navigationItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Button
                    key={item.href}
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Mobile Navigation Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="lg:hidden">
                <Button variant="outline" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navegación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className="gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserCircle className="h-5 w-5" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user?.email?.split("@")[0] || "Usuario"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Mi Cuenta</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 cursor-pointer text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
