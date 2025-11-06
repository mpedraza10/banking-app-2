"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

/**
 * Component wrapper to protect pages that require authentication
 *
 * Usage:
 * ```typescript
 * import { ProtectedRoute } from "@/components/AuthGuard/ProtectedRoute";
 *
 * export default function MyPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Protected content</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
  loadingComponent = <div className="p-8">Loading...</div>,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return <>{loadingComponent}</>;
  }

  if (!user) {
    return null; // Return null while redirecting
  }

  return <>{children}</>;
}
