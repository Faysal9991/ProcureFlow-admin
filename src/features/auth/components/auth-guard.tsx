"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";

type AuthGuardProps = {
  allowPasswordChangeRequired?: boolean;
  children: ReactNode;
  redirectWhenPasswordChangeResolved?: boolean;
};

export function AuthGuard({
  allowPasswordChangeRequired = false,
  children,
  redirectWhenPasswordChangeResolved = false,
}: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRevalidating = useAuthStore((state) => state.isRevalidating);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hasHydrated || isRevalidating) {
      return;
    }

    if (!accessToken || !isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }

    if (!user) {
      return;
    }

    if (user.mustChangePassword && !allowPasswordChangeRequired) {
      router.replace(ROUTES.changePassword);
      return;
    }

    if (user.role === "SUPER_ADMIN" && pathname === ROUTES.dashboard) {
      router.replace(ROUTES.platformCompanies);
      return;
    }

    if (!user.mustChangePassword && redirectWhenPasswordChangeResolved) {
      router.replace(
        user.role === "SUPER_ADMIN" ? ROUTES.platformCompanies : ROUTES.dashboard,
      );
    }
  }, [
    accessToken,
    allowPasswordChangeRequired,
    hasHydrated,
    isAuthenticated,
    isRevalidating,
    pathname,
    redirectWhenPasswordChangeResolved,
    router,
    user,
  ]);

  const isLoading =
    !hasHydrated ||
    isRevalidating ||
    (!!accessToken && isAuthenticated && !user);

  const isRedirectingToLogin = hasHydrated && (!accessToken || !isAuthenticated);
  const isRedirectingForPasswordChange =
    !!user?.mustChangePassword && !allowPasswordChangeRequired;
  const isRedirectingFromResolvedPassword =
    !!user && !user.mustChangePassword && redirectWhenPasswordChangeResolved;
  const isRedirectingSuperAdminDashboard =
    user?.role === "SUPER_ADMIN" && pathname === ROUTES.dashboard;

  if (
    isLoading ||
    isRedirectingToLogin ||
    isRedirectingForPasswordChange ||
    isRedirectingFromResolvedPassword ||
    isRedirectingSuperAdminDashboard
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="size-5 animate-spin text-primary" />
          Loading session
        </div>
      </div>
    );
  }

  return children;
}
