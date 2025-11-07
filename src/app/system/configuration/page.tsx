"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getSystemConfiguration,
  updateSystemConfiguration,
  getCommissionRates,
  updateCommissionRate,
  getServiceProviders,
  updateServiceProvider,
  type SystemConfiguration,
  type CommissionRate,
  type ServiceProvider,
} from "@/lib/actions/system-configuration";
import { LoadingState } from "@/components/loading";
import { Settings, Percent, Building2, Save } from "lucide-react";

export default function SystemConfigurationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // System configuration state
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(null);
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const [config, rates, providers] = await Promise.all([
        getSystemConfiguration(),
        getCommissionRates(),
        getServiceProviders(),
      ]);
      
      setSystemConfig(config);
      setCommissionRates(rates);
      setServiceProviders(providers);
    } catch (error) {
      console.error("Error loading configuration:", error);
      toast.error("Error al cargar la configuración del sistema");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemConfig = async () => {
    if (!systemConfig || !user) return;

    try {
      setSaving(true);
      await updateSystemConfiguration(user, systemConfig);
      toast.success("Configuración del sistema actualizada");
    } catch (error) {
      console.error("Error saving system configuration:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCommissionRate = async (rate: CommissionRate) => {
    if (!user) return;

    try {
      await updateCommissionRate(user, rate);
      toast.success("Tasa de comisión actualizada");
      await loadConfiguration();
    } catch (error) {
      console.error("Error saving commission rate:", error);
      toast.error("Error al guardar la tasa de comisión");
    }
  };

  const handleSaveServiceProvider = async (provider: ServiceProvider) => {
    if (!user) return;

    try {
      await updateServiceProvider(user, provider);
      toast.success("Proveedor de servicio actualizado");
      await loadConfiguration();
    } catch (error) {
      console.error("Error saving service provider:", error);
      toast.error("Error al guardar el proveedor");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Cargando configuración del sistema..." />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configuración del Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestionar parámetros del sistema, tasas de comisión y proveedores de servicio
            </p>
          </div>

          <Tabs defaultValue="system" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="system" className="gap-2">
                <Settings className="h-4 w-4" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="commissions" className="gap-2">
                <Percent className="h-4 w-4" />
                Comisiones
              </TabsTrigger>
              <TabsTrigger value="providers" className="gap-2">
                <Building2 className="h-4 w-4" />
                Proveedores
              </TabsTrigger>
            </TabsList>

            {/* System Configuration Tab */}
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parámetros del Sistema</CardTitle>
                  <CardDescription>
                    Configurar parámetros generales del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {systemConfig && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                          <Input
                            id="sessionTimeout"
                            type="number"
                            value={systemConfig.session_timeout_minutes}
                            onChange={(e) =>
                              setSystemConfig({
                                ...systemConfig,
                                session_timeout_minutes: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="transactionTimeout">
                            Tiempo Máximo de Transacción (segundos)
                          </Label>
                          <Input
                            id="transactionTimeout"
                            type="number"
                            value={systemConfig.transaction_timeout_seconds}
                            onChange={(e) =>
                              setSystemConfig({
                                ...systemConfig,
                                transaction_timeout_seconds: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="maxRetries">
                            Intentos Máximos de Reintento
                          </Label>
                          <Input
                            id="maxRetries"
                            type="number"
                            value={systemConfig.max_retry_attempts}
                            onChange={(e) =>
                              setSystemConfig({
                                ...systemConfig,
                                max_retry_attempts: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="receiptCopies">
                            Copias de Comprobante por Defecto
                          </Label>
                          <Input
                            id="receiptCopies"
                            type="number"
                            value={systemConfig.default_receipt_copies}
                            onChange={(e) =>
                              setSystemConfig({
                                ...systemConfig,
                                default_receipt_copies: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t pt-4">
                        <div>
                          <p className="text-sm font-medium">Modo de Mantenimiento</p>
                          <p className="text-xs text-muted-foreground">
                            Deshabilitar transacciones para mantenimiento
                          </p>
                        </div>
                        <Select
                          value={systemConfig.maintenance_mode ? "enabled" : "disabled"}
                          onValueChange={(value) =>
                            setSystemConfig({
                              ...systemConfig,
                              maintenance_mode: value === "enabled",
                            })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enabled">Habilitado</SelectItem>
                            <SelectItem value="disabled">Deshabilitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveSystemConfig} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Guardando..." : "Guardar Configuración"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commission Rates Tab */}
            <TabsContent value="commissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tasas de Comisión</CardTitle>
                  <CardDescription>
                    Configurar tasas de comisión por servicio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {commissionRates.map((rate) => (
                      <div
                        key={rate.id}
                        className="flex items-center justify-between border rounded-lg p-4"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{rate.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {rate.service_provider}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Tipo</Label>
                            <Select
                              value={rate.commission_type}
                              onValueChange={(value) => {
                                const updated = {
                                  ...rate,
                                  commission_type: value as "fixed" | "percentage",
                                };
                                handleSaveCommissionRate(updated);
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fijo</SelectItem>
                                <SelectItem value="percentage">Porcentaje</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Valor</Label>
                            <Input
                              type="number"
                              step="0.01"
                              className="w-24"
                              value={rate.commission_value}
                              onChange={(e) => {
                                const updated = {
                                  ...rate,
                                  commission_value: parseFloat(e.target.value),
                                };
                                handleSaveCommissionRate(updated);
                              }}
                            />
                          </div>
                          <Badge variant={rate.is_active ? "default" : "secondary"}>
                            {rate.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Providers Tab */}
            <TabsContent value="providers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Proveedores de Servicio</CardTitle>
                  <CardDescription>
                    Gestionar proveedores de servicio y configuración de integración
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-lg">{provider.provider_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {provider.service_type}
                            </p>
                          </div>
                          <Badge variant={provider.is_active ? "default" : "secondary"}>
                            {provider.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">URL de API</Label>
                            <Input
                              value={provider.api_endpoint || ""}
                              onChange={(e) => {
                                const updated = {
                                  ...provider,
                                  api_endpoint: e.target.value,
                                };
                                handleSaveServiceProvider(updated);
                              }}
                              placeholder="https://api.provider.com"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Tiempo Máximo (segundos)</Label>
                            <Input
                              type="number"
                              value={provider.timeout_seconds}
                              onChange={(e) => {
                                const updated = {
                                  ...provider,
                                  timeout_seconds: parseInt(e.target.value),
                                };
                                handleSaveServiceProvider(updated);
                              }}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Intentos de Reintento</Label>
                            <Input
                              type="number"
                              value={provider.retry_attempts}
                              onChange={(e) => {
                                const updated = {
                                  ...provider,
                                  retry_attempts: parseInt(e.target.value),
                                };
                                handleSaveServiceProvider(updated);
                              }}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Estado</Label>
                            <Select
                              value={provider.is_active ? "active" : "inactive"}
                              onValueChange={(value) => {
                                const updated = {
                                  ...provider,
                                  is_active: value === "active",
                                };
                                handleSaveServiceProvider(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="inactive">Inactivo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
