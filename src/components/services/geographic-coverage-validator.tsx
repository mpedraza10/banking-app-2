"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import { validateGeographicCoverage } from "@/lib/actions/services";
import { getServiceCoverage } from "@/lib/actions/service-catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { GeographicCoverage } from "@/lib/db/schema";

interface GeographicCoverageValidatorProps {
  serviceId: string;
  serviceName: string;
  onValidationComplete?: (isAvailable: boolean) => void;
}

export function GeographicCoverageValidator({
  serviceId,
  serviceName,
  onValidationComplete,
}: GeographicCoverageValidatorProps) {
  const { user } = useAuth();
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [validationResult, setValidationResult] = useState<{
    isAvailable: boolean;
    message: string;
  } | null>(null);

  // Fetch coverage areas for the service
  const { data: coverageData } = useQuery({
    queryKey: ["service-coverage", serviceId],
    queryFn: () => getServiceCoverage(user, serviceId),
    enabled: !!user && !!serviceId,
  });

  const handleValidate = async () => {
    if (!state) {
      toast.error("Please select a state");
      return;
    }

    try {
      const result = await validateGeographicCoverage(
        user,
        serviceId,
        state,
        city || undefined,
        postalCode || undefined
      );

      setValidationResult(result);
      
      if (onValidationComplete) {
        onValidationComplete(result.isAvailable);
      }

      if (result.isAvailable) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Validation failed"
      );
    }
  };

  // Get unique states from coverage data
  const availableStates = Array.from(
    new Set(coverageData?.data?.map((c: GeographicCoverage) => c.state) || [])
  );

  // Get cities for selected state
  const availableCities = Array.from(
    new Set(
      coverageData?.data
        ?.filter((c: GeographicCoverage) => c.state === state && c.city)
        .map((c: GeographicCoverage) => c.city) || []
    )
  ).filter((city): city is string => city !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Geographic Coverage Validation - {serviceName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="state">State *</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map((s: string) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="city">City (Optional)</Label>
            <Select value={city} onValueChange={setCity} disabled={!state}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((c: string) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code (Optional)</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter postal code"
              maxLength={5}
            />
          </div>
        </div>

        <Button onClick={handleValidate} className="w-full">
          Validate Coverage
        </Button>

        {validationResult && (
          <Alert
            variant={validationResult.isAvailable ? "default" : "destructive"}
            className={
              validationResult.isAvailable
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }
          >
            {validationResult.isAvailable ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                validationResult.isAvailable ? "text-green-800" : "text-red-800"
              }
            >
              {validationResult.message}
            </AlertDescription>
          </Alert>
        )}

        {coverageData?.data && coverageData.data.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">Coverage Areas:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {coverageData.data.map((coverage: GeographicCoverage) => (
                <div
                  key={coverage.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{coverage.state}</span>
                    {coverage.city && (
                      <span className="text-gray-600"> - {coverage.city}</span>
                    )}
                    {coverage.postalCode && (
                      <span className="text-gray-500"> ({coverage.postalCode})</span>
                    )}
                  </div>
                  <Badge variant={coverage.isActive ? "default" : "secondary"}>
                    {coverage.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
