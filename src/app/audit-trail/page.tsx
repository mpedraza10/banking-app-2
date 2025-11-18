"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Search, Filter, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getRecentAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByEntity,
  type AuditLogEntry,
} from "@/lib/actions/audit-logs";

export default function AuditTrailPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterType, setFilterType] = useState<"recent" | "user" | "entity">("recent");
  const [filterValue, setFilterValue] = useState("");

  const loadLogs = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const recentLogs = await getRecentAuditLogs(user, 50);
      setLogs(recentLogs);
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar el registro de auditoría"
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilter = async () => {
    if (!user || !filterValue.trim()) {
      await loadLogs();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let filteredLogs: AuditLogEntry[] = [];

      if (filterType === "user") {
        filteredLogs = await getAuditLogsByUser(user, filterValue.trim(), 50);
      } else if (filterType === "entity") {
        // For entity filter, we need both entityType and entityId
        // Format: "entityType:entityId"
        const [entityType, entityId] = filterValue.split(":");
        if (entityType && entityId) {
          filteredLogs = await getAuditLogsByEntity(user, entityType.trim(), entityId.trim());
        } else {
          setError("Formato inválido. Use: tipoEntidad:idEntidad");
          return;
        }
      } else {
        filteredLogs = await getRecentAuditLogs(user, 50);
      }

      setLogs(filteredLogs);
    } catch (err) {
      console.error("Error filtering audit logs:", err);
      setError(
        err instanceof Error ? err.message : "Error al filtrar el registro"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("Created") || action.includes("Generated")) {
      return "default";
    }
    if (action.includes("Posted") || action.includes("Completed")) {
      return "default";
    }
    if (action.includes("Cancelled") || action.includes("Failed")) {
      return "destructive";
    }
    if (action.includes("Updated") || action.includes("Modified")) {
      return "secondary";
    }
    return "outline";
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registro de Auditoría</CardTitle>
          <p className="text-muted-foreground">
            Historial completo de transacciones y acciones del sistema
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filter Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Filtro</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "recent" | "user" | "entity")}
                >
                  <option value="recent">Recientes</option>
                  <option value="user">Por Usuario</option>
                  <option value="entity">Por Entidad</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Valor del Filtro</Label>
                <Input
                  type="text"
                  placeholder={
                    filterType === "recent"
                      ? "No requerido"
                      : filterType === "user"
                      ? "ID del usuario"
                      : "Tipo:ID (ej: Transaction:123)"
                  }
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  disabled={filterType === "recent"}
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleFilter}
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {filterType === "recent" ? (
                    <>
                      <Filter className="h-4 w-4" />
                      Recargar
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Filtrar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Audit Logs List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Registros de Auditoría ({logs.length})
              </h3>
              {loading && <Spinner className="h-4 w-4" />}
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron registros de auditoría
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getActionBadgeVariant(log.action)}>
                              {log.action}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {log.entityType}
                            </span>
                            {log.entityId && (
                              <span className="text-xs text-muted-foreground font-mono">
                                ID: {log.entityId.slice(0, 8)}...
                              </span>
                            )}
                          </div>

                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Usuario:</span>
                              <span className="font-mono text-xs">
                                {log.userId.slice(0, 8)}...
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Fecha:</span>
                              <span>{formatDate(log.timestamp)}</span>
                            </div>
                            {log.ipAddress && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">IP:</span>
                                <span className="font-mono text-xs">
                                  {log.ipAddress}
                                </span>
                              </div>
                            )}
                          </div>

                          {log.details && (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Ver detalles
                              </summary>
                              <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto text-xs">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
