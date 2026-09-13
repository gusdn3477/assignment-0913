import type { ReactNode } from "react";

export function LoadingGuard({
  loading,
  fallback,
  children,
}: {
  loading: boolean;
  fallback: ReactNode;
  children: ReactNode;
}) {
  return loading ? fallback : children;
}
