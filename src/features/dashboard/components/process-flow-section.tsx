"use client";

import {
  BadgeCheck,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileText,
  GitBranch,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const processSteps = [
  {
    description: "Create company, assign plan, manage subscription and billing.",
    icon: ShieldCheck,
    owner: "Super Admin",
    title: "Platform setup",
  },
  {
    description: "Configure departments, users, roles, settings, workflows, and budgets.",
    icon: Building2,
    owner: "Company Admin",
    title: "Company setup",
  },
  {
    description: "Create purchase requests with items, attachments, budget context, and needed dates.",
    icon: FileText,
    owner: "Employee / Abdur Rohoman",
    title: "Request creation",
  },
  {
    description: "Review pending requests, approve or reject with comments, and track approval history.",
    icon: ClipboardCheck,
    owner: "Manager",
    title: "Approval review",
  },
  {
    description: "Manage vendors, RFQs, quotation comparison, and purchase order lifecycle.",
    icon: ShoppingCart,
    owner: "Procurement",
    title: "Procurement execution",
  },
  {
    description: "Create invoices from received POs, record payments, and monitor due balances.",
    icon: CreditCard,
    owner: "Finance",
    title: "Finance settlement",
  },
  {
    description: "Use reports, audit logs, attachments, and dashboards to close the operating loop.",
    icon: PackageCheck,
    owner: "Company Admin / Finance / Procurement",
    title: "Control and visibility",
  },
];

const demoUsers = [
  { email: "superadmin@procureflow.com", name: "Super Admin", role: "SUPER_ADMIN" },
  { email: "admin@company.com", name: "Company Admin", role: "COMPANY_ADMIN" },
  { email: "employee@company.com", name: "Employee User", role: "EMPLOYEE" },
  { email: "manager@company.com", name: "Manager User", role: "MANAGER" },
  { email: "procurement@company.com", name: "Procurement User", role: "PROCUREMENT" },
  { email: "finance@company.com", name: "Finance User", role: "FINANCE" },
  { email: "abdurrohoman@gmail.com", name: "Abdur Rohoman", role: "EMPLOYEE" },
];

export function ProcessFlowSection() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitBranch className="size-5" />
            </div>
            <div>
              <CardTitle>Full Process Flow</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Temporary workflow guide for validating each role end to end.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-card">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary">Step {index + 1}</Badge>
                        <p className="text-sm font-semibold text-foreground">
                          {step.title}
                        </p>
                      </div>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        Owner: {step.owner}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <CardTitle>Process Users</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Role accounts available for manual flow testing.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demoUsers.map((user) => (
              <div
                key={user.email}
                className="rounded-lg border border-border bg-background p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant={user.role === "SUPER_ADMIN" ? "warning" : "default"}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-info/20 bg-info/10 p-3 text-sm text-info">
            <BadgeCheck className="mt-0.5 size-4 shrink-0" />
            <p>
              This section is for process validation only. Passwords are not
              displayed here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
