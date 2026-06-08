"use client";

import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/layout/user-menu";
import { getRouteNavigationItem } from "@/lib/constants/navigation";

type HeaderProps = {
  onOpenSidebar: () => void;
};

export function Header({ onOpenSidebar }: HeaderProps) {
  const pathname = usePathname();
  const routeItem = getRouteNavigationItem(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0">
          <Breadcrumbs pathname={pathname} />
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {routeItem?.title ?? "Admin"}
          </p>
        </div>

        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search requests, vendors, invoices"
            className="pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Alerts">
            <Bell className="size-5" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
