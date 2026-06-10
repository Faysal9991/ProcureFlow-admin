import { ROUTES } from "./routes";
import type { AdminRole, AuthUser } from "@/types/auth";

export type NavigationIcon =
  | "approvalWorkflows"
  | "approvals"
  | "attachments"
  | "auditLogs"
  | "billing"
  | "budgets"
  | "companies"
  | "dashboard"
  | "departments"
  | "invoices"
  | "payments"
  | "plans"
  | "purchaseOrders"
  | "purchaseRequests"
  | "reports"
  | "rolesPermissions"
  | "rfqs"
  | "settings"
  | "subscriptions"
  | "users"
  | "vendors";

export type NavigationItem = {
  allowedRoles?: AdminRole[];
  excludedRoles?: AdminRole[];
  href: string;
  icon: NavigationIcon;
  requiredPermissions?: string[];
  superAdminOnly?: boolean;
  title: string;
};

export type NavigationGroup = {
  items: NavigationItem[];
  title: string;
};

const allRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "EMPLOYEE",
  "FINANCE",
  "MANAGER",
  "PROCUREMENT",
  "SUPER_ADMIN",
];

const tenantRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "EMPLOYEE",
  "FINANCE",
  "MANAGER",
  "PROCUREMENT",
];

const adminRoles: AdminRole[] = ["COMPANY_ADMIN"];
const approvalRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "FINANCE",
  "MANAGER",
  "PROCUREMENT",
];
const approvalWorkflowRoles: AdminRole[] = ["COMPANY_ADMIN", "PROCUREMENT"];
const purchaseOrderRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "FINANCE",
  "PROCUREMENT",
];
const rfqRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "FINANCE",
  "MANAGER",
  "PROCUREMENT",
];
const vendorRoles: AdminRole[] = ["COMPANY_ADMIN", "FINANCE", "PROCUREMENT"];
const invoiceRoles: AdminRole[] = ["COMPANY_ADMIN", "FINANCE", "PROCUREMENT"];
const financeRoles: AdminRole[] = ["COMPANY_ADMIN", "FINANCE"];
const settingsRoles: AdminRole[] = ["COMPANY_ADMIN", "FINANCE", "PROCUREMENT"];
export const navigationGroups: NavigationGroup[] = [
  {
    title: "Overview",
    items: [
      {
        allowedRoles: allRoles,
        href: ROUTES.dashboard,
        icon: "dashboard",
        title: "Dashboard",
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        allowedRoles: adminRoles,
        href: ROUTES.users,
        icon: "users",
        title: "Users",
      },
      {
        allowedRoles: adminRoles,
        href: ROUTES.departments,
        icon: "departments",
        title: "Departments",
      },
      {
        allowedRoles: adminRoles,
        href: ROUTES.rolesPermissions,
        icon: "rolesPermissions",
        title: "Roles & Permissions",
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        allowedRoles: tenantRoles,
        href: ROUTES.purchaseRequests,
        icon: "purchaseRequests",
        title: "Purchase Requests",
      },
      {
        allowedRoles: approvalRoles,
        href: ROUTES.approvals,
        icon: "approvals",
        title: "Approvals",
      },
      {
        allowedRoles: approvalWorkflowRoles,
        href: ROUTES.approvalWorkflows,
        icon: "approvalWorkflows",
        title: "Approval Workflows",
      },
      {
        allowedRoles: vendorRoles,
        href: ROUTES.vendors,
        icon: "vendors",
        title: "Vendors",
      },
      {
        allowedRoles: rfqRoles,
        href: ROUTES.rfqs,
        icon: "rfqs",
        requiredPermissions: ["rfq.view", "rfq.manage"],
        title: "RFQ",
      },
      {
        allowedRoles: purchaseOrderRoles,
        href: ROUTES.purchaseOrders,
        icon: "purchaseOrders",
        title: "Purchase Orders",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        allowedRoles: invoiceRoles,
        href: ROUTES.invoices,
        icon: "invoices",
        requiredPermissions: ["invoice.view"],
        title: "Invoices",
      },
      {
        allowedRoles: financeRoles,
        href: ROUTES.payments,
        icon: "payments",
        requiredPermissions: ["payment.view"],
        title: "Payments",
      },
      {
        excludedRoles: ["SUPER_ADMIN"],
        href: ROUTES.budgets,
        icon: "budgets",
        requiredPermissions: ["budget.view"],
        title: "Budgets",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        excludedRoles: ["SUPER_ADMIN"],
        href: ROUTES.reports,
        icon: "reports",
        requiredPermissions: [
          "report.purchase_request.view",
          "report.approval.view",
          "report.purchase_order.view",
          "report.invoice.view",
          "report.payment.view",
        ],
        title: "Reports",
      },
      {
        excludedRoles: ["SUPER_ADMIN"],
        href: ROUTES.auditLogs,
        icon: "auditLogs",
        requiredPermissions: ["audit.view"],
        title: "Audit Logs",
      },
      {
        allowedRoles: tenantRoles,
        excludedRoles: ["SUPER_ADMIN"],
        href: ROUTES.attachments,
        icon: "attachments",
        requiredPermissions: ["attachment.view"],
        title: "Attachments",
      },
      {
        allowedRoles: settingsRoles,
        excludedRoles: ["SUPER_ADMIN"],
        href: ROUTES.settings,
        icon: "settings",
        title: "Settings",
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        href: ROUTES.platformCompanies,
        icon: "companies",
        superAdminOnly: true,
        title: "Companies",
      },
      {
        href: ROUTES.platformPlans,
        icon: "plans",
        superAdminOnly: true,
        title: "Plans",
      },
      {
        href: ROUTES.platformSubscriptions,
        icon: "subscriptions",
        superAdminOnly: true,
        title: "Subscriptions",
      },
      {
        href: ROUTES.platformBilling,
        icon: "billing",
        superAdminOnly: true,
        title: "Billing",
      },
    ],
  },
];

export const navigationItems = navigationGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, groupTitle: group.title })),
);

export function canShowNavigationItem(
  item: NavigationItem,
  user: AuthUser | null,
  permissions: string[],
) {
  if (!user) {
    return false;
  }

  if (item.superAdminOnly) {
    return user.role === "SUPER_ADMIN";
  }

  if (item.excludedRoles?.includes(user.role as AdminRole)) {
    return false;
  }

  if (
    item.requiredPermissions?.some((permission) =>
      permissions.includes(permission),
    )
  ) {
    return true;
  }

  if (item.allowedRoles?.includes(user.role as AdminRole)) {
    return true;
  }

  return !item.allowedRoles && !item.requiredPermissions;
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getRouteNavigationItem(pathname: string) {
  return [...navigationItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isNavigationItemActive(pathname, item.href));
}
