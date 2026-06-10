"use client";

import { useState, type ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background bg-[linear-gradient(180deg,#ffffff_0%,#f6f7f9_44%,#f3f4f6_100%)]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="lg:pl-72">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="animate-panel-in px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
