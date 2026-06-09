export const ROUTES = {
  approvalWorkflows: "/approval-workflows",
  approvals: "/approvals",
  auditLogs: "/audit-logs",
  budgets: "/budgets",
  changePassword: "/change-password",
  dashboard: "/dashboard",
  departments: "/departments",
  home: "/",
  invoices: "/invoices",
  login: "/login",
  payments: "/payments",
  platformBilling: "/platform/billing",
  platformCompanies: "/platform/companies",
  platformPlans: "/platform/plans",
  platformSubscriptions: "/platform/subscriptions",
  purchaseOrders: "/purchase-orders",
  purchaseRequests: "/purchase-requests",
  reports: "/reports",
  rolesPermissions: "/roles-permissions",
  rfqs: "/rfqs",
  settings: "/settings",
  users: "/users",
  vendors: "/vendors",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
