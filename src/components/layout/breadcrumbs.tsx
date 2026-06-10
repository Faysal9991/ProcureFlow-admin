"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import { getRouteNavigationItem } from "@/lib/constants/navigation";

type BreadcrumbsProps = {
  pathname: string;
};

export function Breadcrumbs({ pathname }: BreadcrumbsProps) {
  const currentItem = getRouteNavigationItem(pathname);
  const groupTitle = currentItem?.groupTitle;
  const title = currentItem?.title ?? "Admin";
  const isDashboard = pathname === ROUTES.dashboard;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
        <li>
          <Link
            href={ROUTES.dashboard}
            className="transition-colors duration-200 hover:text-foreground"
          >
            Admin
          </Link>
        </li>
        {groupTitle && !isDashboard ? (
          <>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="truncate">{groupTitle}</li>
          </>
        ) : null}
        {!isDashboard ? (
          <>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="truncate font-medium text-foreground">{title}</li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}
