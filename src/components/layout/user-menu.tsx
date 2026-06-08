"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, UserCircle } from "lucide-react";
import { LogoutButton } from "@/features/auth/components";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils/cn";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const displayName = user?.name || "Admin User";
  const displayRole = user?.role || "Admin";
  const initials = getInitials(displayName || user?.email || "Admin User");

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          "flex items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-muted",
          isOpen && "bg-muted",
        )}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{displayRole}</p>
        </div>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-72 rounded-lg border border-border bg-surface p-2 shadow-card"
        >
          <div className="flex items-start gap-3 border-b border-border px-3 py-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? "No email"}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">
                {displayRole}
              </p>
              {user?.companyId ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Company #{user.companyId}
                </p>
              ) : null}
            </div>
          </div>

          <div className="py-2">
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <UserCircle className="size-4" />
              Account controls
            </div>
            <LogoutButton
              className="w-full justify-start text-error hover:text-error"
              variant="ghost"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AU";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
