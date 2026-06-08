"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setApiAuthToken } from "@/lib/api/client";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import type { AuthSession, AuthUser } from "@/types/auth";

type AuthStore = {
  accessToken: string | null;
  clearPermissions: () => void;
  clearSession: () => void;
  hasHydrated: boolean;
  isAuthenticated: boolean;
  isRevalidating: boolean;
  permissions: string[];
  setHasHydrated: (hasHydrated: boolean) => void;
  setPermissions: (permissions: string[]) => void;
  setRevalidating: (isRevalidating: boolean) => void;
  setSession: (session: AuthSession) => void;
  updateUser: (user: AuthUser | Partial<AuthUser>) => void;
  user: AuthUser | null;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      clearPermissions: () => set({ permissions: [] }),
      clearSession: () => {
        setApiAuthToken();
        set({
          accessToken: null,
          isAuthenticated: false,
          isRevalidating: false,
          permissions: [],
          user: null,
        });
      },
      hasHydrated: false,
      isAuthenticated: false,
      isRevalidating: false,
      permissions: [],
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setPermissions: (permissions) => set({ permissions }),
      setRevalidating: (isRevalidating) => set({ isRevalidating }),
      setSession: (session) => {
        setApiAuthToken(session.accessToken);
        set({
          accessToken: session.accessToken,
          isAuthenticated: true,
          isRevalidating: false,
          user: session.user,
        });
      },
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : (user as AuthUser),
        })),
      user: null,
    }),
    {
      name: STORAGE_KEYS.auth,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        user: state.user,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
