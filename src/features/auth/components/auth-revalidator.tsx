"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { getCurrentPermissions, getMe } from "../api";

export function AuthRevalidator() {
  const router = useRouter();
  const pathname = usePathname();
  const validatedTokenRef = useRef<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const setRevalidating = useAuthStore((state) => state.setRevalidating);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!accessToken) {
      validatedTokenRef.current = null;
      setRevalidating(false);
      return;
    }

    if (validatedTokenRef.current === accessToken) {
      return;
    }

    const token = accessToken;
    let isActive = true;

    async function revalidateSession() {
      setRevalidating(true);

      try {
        const user = await getMe();
        let permissions: string[] = [];

        try {
          permissions = await getCurrentPermissions();
        } catch {
          permissions = [];
        }

        if (!isActive) {
          return;
        }

        validatedTokenRef.current = token;
        setSession({ accessToken: token, user });
        setPermissions(permissions);

        if (
          user.mustChangePassword &&
          pathname !== ROUTES.changePassword &&
          pathname !== ROUTES.login
        ) {
          router.replace(ROUTES.changePassword);
          return;
        }

        if (user.role === "SUPER_ADMIN" && pathname === ROUTES.dashboard) {
          router.replace(ROUTES.platformCompanies);
        }
      } catch {
        if (!isActive) {
          return;
        }

        validatedTokenRef.current = null;
        clearSession();

        if (pathname !== ROUTES.login) {
          router.replace(ROUTES.login);
        }
      } finally {
        if (isActive) {
          setRevalidating(false);
        }
      }
    }

    revalidateSession();

    return () => {
      isActive = false;
    };
  }, [
    accessToken,
    clearSession,
    hasHydrated,
    pathname,
    router,
    setPermissions,
    setRevalidating,
    setSession,
  ]);

  return null;
}
