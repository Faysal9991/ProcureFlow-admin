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
  GitBranch,
  LayoutDashboard,
  Landmark,
  Paperclip,
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
  approvalWorkflows: GitBranch,
  approvals: ClipboardCheck,
  attachments: Paperclip,
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
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-elevated transition-transform duration-300 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-base font-bold text-white shadow-primary">
            PF
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {APP_CONFIG.name}
            </p>
            <p className="text-xs text-sidebar-subtle">Admin Console</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md p-2 text-sidebar-subtle transition-all duration-200 hover:bg-white/10 hover:text-sidebar-foreground lg:hidden"
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
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-normal text-sidebar-subtle/80">
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
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
                          isActive
                            ? "bg-primary text-white shadow-primary"
                            : "text-sidebar-subtle hover:translate-x-0.5 hover:bg-white/10 hover:text-sidebar-foreground",
                        )}
                        onClick={onClose}
                      >
                        <Icon
                          className={cn(
                            "size-5 shrink-0 transition-transform duration-200",
                            isActive && "scale-105",
                          )}
                        />
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
