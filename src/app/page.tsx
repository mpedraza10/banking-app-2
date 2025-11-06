"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-3xl">CC</span>
          </div>
          <CardTitle className="text-3xl">Caja Cooperativa</CardTitle>
          <CardDescription className="text-base">
            Sistema de Gestión de Cajeros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 text-lg"
            onClick={() => router.push("/auth/login")}
          >
            Iniciar Sesión
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-lg"
            onClick={() => router.push("/auth/signup")}
          >
            Registrarse
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
