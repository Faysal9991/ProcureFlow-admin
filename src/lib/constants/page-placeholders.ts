import { ROUTES } from "./routes";

type BadgeVariant = "default" | "error" | "info" | "primary" | "success" | "warning";

export type PlaceholderPageConfig = {
  badgeVariant: BadgeVariant;
  description: string;
  eyebrow: string;
  focusAreas: string[];
  metrics: Array<{
    caption: string;
    label: string;
    value: string;
  }>;
  owner: string;
  previewDescription: string;
  route: string;
  status: string;
  title: string;
};

const defaultMetrics = [
  {
    caption: "Ready for API integration",
    label: "Module status",
    value: "Shell",
  },
  {
    caption: "Designed for desktop and mobile",
    label: "Layout",
    value: "Responsive",
  },
  {
    caption: "Protected by admin route guard",
    label: "Access",
    value: "Secured",
  },
];

export const pagePlaceholders = {
  approvals: createPage({
    description:
      "Track approval queues, decision status, escalation timing, and review ownership.",
    focusAreas: ["Pending approvals", "Escalation rules", "Approval history"],
    owner: "Procurement and management",
    route: ROUTES.approvals,
    title: "Approvals",
  }),
  auditLogs: createPage({
    badgeVariant: "warning",
    description:
      "Review administrative actions, entity history, access events, and exportable audit trails.",
    focusAreas: ["Auth events", "Entity activity", "Export controls"],
    owner: "Compliance",
    route: ROUTES.auditLogs,
    title: "Audit Logs",
  }),
  budgets: createPage({
    description:
      "Monitor budget availability, allocations, adjustments, and purchase commitment impact.",
    focusAreas: ["Budget overview", "Adjustments", "Committed spend"],
    owner: "Finance",
    route: ROUTES.budgets,
    title: "Budgets",
  }),
  departments: createPage({
    description:
      "Maintain department records, reporting structure, approvers, and purchasing ownership.",
    focusAreas: ["Department list", "Approver assignment", "Spend ownership"],
    owner: "Company administration",
    route: ROUTES.departments,
    title: "Departments",
  }),
  invoices: createPage({
    description:
      "Manage invoice intake, matching status, payment readiness, and finance review.",
    focusAreas: ["Invoice register", "3-way match", "Review exceptions"],
    owner: "Finance",
    route: ROUTES.invoices,
    title: "Invoices",
  }),
  payments: createPage({
    description:
      "Track payment scheduling, settlement status, references, and supplier payment history.",
    focusAreas: ["Payment queue", "Settlement references", "Vendor balances"],
    owner: "Finance",
    route: ROUTES.payments,
    title: "Payments",
  }),
  platformBilling: createPage({
    badgeVariant: "primary",
    description:
      "Manage platform billing controls, billing events, and account-level commercial state.",
    focusAreas: ["Billing status", "Invoices", "Account events"],
    owner: "Super Admin",
    route: ROUTES.platformBilling,
    title: "Billing",
  }),
  platformCompanies: createPage({
    badgeVariant: "primary",
    description:
      "Oversee tenant companies, subscription state, activation, suspension, and platform access.",
    focusAreas: ["Company directory", "Tenant health", "Access controls"],
    owner: "Super Admin",
    route: ROUTES.platformCompanies,
    title: "Companies",
  }),
  platformPlans: createPage({
    badgeVariant: "primary",
    description:
      "Configure subscription plans, entitlement levels, and commercial package structure.",
    focusAreas: ["Plan catalog", "Entitlements", "Pricing metadata"],
    owner: "Super Admin",
    route: ROUTES.platformPlans,
    title: "Plans",
  }),
  platformSubscriptions: createPage({
    badgeVariant: "primary",
    description:
      "Review company subscriptions, plan assignments, renewal state, and grace-period status.",
    focusAreas: ["Subscription list", "Plan assignment", "Renewal state"],
    owner: "Super Admin",
    route: ROUTES.platformSubscriptions,
    title: "Subscriptions",
  }),
  purchaseOrders: createPage({
    description:
      "Control issued purchase orders, receiving status, supplier commitments, and closeout.",
    focusAreas: ["PO register", "Issue controls", "Receiving status"],
    owner: "Procurement",
    route: ROUTES.purchaseOrders,
    title: "Purchase Orders",
  }),
  purchaseRequests: createPage({
    description:
      "Review purchase requests, request ownership, budget impact, and procurement conversion.",
    focusAreas: ["Request intake", "Budget checks", "Conversion to RFQ or PO"],
    owner: "Procurement",
    route: ROUTES.purchaseRequests,
    title: "Purchase Requests",
  }),
  reports: createPage({
    description:
      "Analyze procurement, approval, purchase order, invoice, payment, and spend performance.",
    focusAreas: ["Operational reports", "Finance reports", "Export actions"],
    owner: "Management",
    route: ROUTES.reports,
    title: "Reports",
  }),
  rfqs: createPage({
    description:
      "Manage RFQ drafting, vendor invitations, quotation comparison, and supplier selection.",
    focusAreas: ["RFQ pipeline", "Vendor invitations", "Quote comparison"],
    owner: "Procurement",
    route: ROUTES.rfqs,
    title: "RFQ",
  }),
  rolesPermissions: createPage({
    badgeVariant: "warning",
    description:
      "Configure company roles, permission assignments, and user access responsibilities.",
    focusAreas: ["Role catalog", "Permission matrix", "User assignments"],
    owner: "Company administration",
    route: ROUTES.rolesPermissions,
    title: "Roles & Permissions",
  }),
  settings: createPage({
    description:
      "Manage company settings, workflow defaults, notification preferences, and admin controls.",
    focusAreas: ["Company settings", "Workflow defaults", "Notification controls"],
    owner: "Company administration",
    route: ROUTES.settings,
    title: "Settings",
  }),
  users: createPage({
    description:
      "Manage employee access, role assignment, department membership, and account status.",
    focusAreas: ["User directory", "Role assignment", "Account status"],
    owner: "Company administration",
    route: ROUTES.users,
    title: "Users",
  }),
  vendors: createPage({
    description:
      "Maintain vendor records, compliance details, contact information, and supplier readiness.",
    focusAreas: ["Vendor list", "Compliance profile", "Supplier contacts"],
    owner: "Procurement",
    route: ROUTES.vendors,
    title: "Vendors",
  }),
} satisfies Record<string, PlaceholderPageConfig>;

function createPage({
  badgeVariant = "info",
  description,
  focusAreas,
  owner,
  route,
  title,
}: {
  badgeVariant?: BadgeVariant;
  description: string;
  focusAreas: string[];
  owner: string;
  route: string;
  title: string;
}): PlaceholderPageConfig {
  return {
    badgeVariant,
    description,
    eyebrow: "Admin Module",
    focusAreas,
    metrics: defaultMetrics,
    owner,
    previewDescription: `${title} will receive data tables, filters, and actions in its implementation phase.`,
    route,
    status: "Placeholder",
    title,
  };
}
