"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  BarChart3,
  BadgeDollarSign,
  Building2,
  Building,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Landmark,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants/app";
import {
  canShowNavigationItem,
  isNavigationItemActive,
  navigationGroups,
  type NavigationIcon,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth-store";

const iconMap: Record<NavigationIcon, ComponentType<{ className?: string }>> = {
  approvals: ClipboardCheck,
  auditLogs: ScrollText,
  billing: CreditCard,
  budgets: Wallet,
  companies: Building,
  dashboard: LayoutDashboard,
  departments: Building2,
  invoices: ReceiptText,
  payments: BadgeDollarSign,
  plans: Landmark,
  purchaseOrders: ShoppingCart,
  purchaseRequests: FileCheck2,
  reports: BarChart3,
  rolesPermissions: ShieldCheck,
  rfqs: FileText,
  settings: Settings,
  subscriptions: CreditCard,
  users: Users,
  vendors: Store,
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">
            PF
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {APP_CONFIG.name}
            </p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              canShowNavigationItem(item, user, permissions),
            );

            if (visibleItems.length === 0) {
              return null;
            }

            return (
              <div key={group.title}>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = iconMap[item.icon];
                    const isActive = isNavigationItemActive(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-white"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        onClick={onClose}
                      >
                        <Icon className="size-5 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
