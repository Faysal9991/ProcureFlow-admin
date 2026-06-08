import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { ProtectedRoute } from "@/features/auth/components";

export default function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
