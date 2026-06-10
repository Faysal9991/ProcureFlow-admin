"use client";

import { Building2, LockKeyhole, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type SettingsTab = "profile" | "procurement" | "security";

type SettingsTabsProps = {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
};

const tabs: {
  description: string;
  icon: typeof Building2;
  label: string;
  value: SettingsTab;
}[] = [
  {
    description: "Company identity and contact details",
    icon: Building2,
    label: "Profile",
    value: "profile",
  },
  {
    description: "RFQ, budget, currency, and workflow defaults",
    icon: ShoppingCart,
    label: "Procurement",
    value: "procurement",
  },
  {
    description: "Password rotation and session expiry",
    icon: LockKeyhole,
    label: "Security",
    value: "security",
  },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            className={cn(
              "flex min-h-20 items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-primary/40",
              isActive && "border-primary bg-primary/5",
            )}
            type="button"
            onClick={() => onTabChange(tab.value)}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                isActive && "bg-primary text-white",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                {tab.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {tab.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
