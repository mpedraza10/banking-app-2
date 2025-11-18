"use client";

import React from "react"; 
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CreditCard,
  Receipt,
  Coins,
  FileText,
  Settings,
  History,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const modules = [
    {
      title: "Búsqueda de Clientes",
      description: "Buscar y gestionar información de clientes",
      icon: Search,
      href: "/customers/search",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Pago de Servicios",
      description: "Procesar pagos de servicios (CFE, Telmex, etc.)",
      icon: Receipt,
      href: "/services/payment",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Pago de Tarjetas",
      description: "Procesar pagos de tarjetas de crédito",
      icon: CreditCard,
      href: "/cards/payment",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Pago Diestel",
      description: "Gestionar pagos Diestel y programación SPEI",
      icon: FileText,
      href: "/diestel/payment",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      title: "Efectivo y Denominaciones",
      description: "Gestionar caja de efectivo y denominaciones",
      icon: Coins,
      href: "/denominations/cash-received",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      title: "Historial de Transacciones",
      description: "Ver historial y reimprimir comprobantes",
      icon: History,
      href: "/transactions/reprint",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      title: "Auditoría",
      description: "Revisar registro de auditoría del sistema",
      icon: LayoutDashboard,
      href: "/audit-trail",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "Catálogo de Servicios",
      description: "Administrar catálogo de servicios disponibles",
      icon: Settings,
      href: "/services/catalog",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
    },
  ];

  const handleModuleClick = (href: string) => {
    router.push(href);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  {user?.email}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <Card className="mb-8 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl">Bienvenido al Sistema</CardTitle>
              <CardDescription className="text-base">
                Seleccione un módulo para comenzar a trabajar
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.href}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 dark:hover:border-blue-400"
                  onClick={() => handleModuleClick(module.href)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-lg ${module.bgColor} group-hover:scale-110 transition-transform`}
                      >
                        <Icon className={`h-6 w-6 ${module.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-4">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    >
                      Abrir Módulo
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Sesión Activa
                </CardTitle>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  En Línea
                </p>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Estado del Sistema
                </CardTitle>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  Operativo
                </p>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Acceso Rápido
                </CardTitle>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => router.push("/customers/search")}
                >
                  Buscar Cliente
                </Button>
              </CardHeader>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>© 2024 Caja Cooperativa - Sistema de Gestión de Cajeros</p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
