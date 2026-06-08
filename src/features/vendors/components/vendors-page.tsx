"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useVendors } from "../hooks";
import type { Vendor, VendorListFilters, VendorStatus } from "../types";
import { VENDOR_PAGE_SIZE } from "../utils";
import { DeleteVendorDialog } from "./delete-vendor-dialog";
import { VendorFilters } from "./vendor-filters";
import { VendorFormDrawer } from "./vendor-form-drawer";
import { VendorsTable } from "./vendors-table";

const readableRoles = ["COMPANY_ADMIN", "PROCUREMENT", "FINANCE"];
const manageableRoles = ["COMPANY_ADMIN", "PROCUREMENT"];

export function VendorsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canRead = readableRoles.includes(currentUser?.role ?? "");
  const canManage = manageableRoles.includes(currentUser?.role ?? "");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | VendorStatus>("ALL");
  const [page, setPage] = useState(1);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryFilters = useMemo<VendorListFilters>(
    () => ({
      limit: VENDOR_PAGE_SIZE,
      page,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [page, search, status],
  );
  const vendorsQuery = useVendors(queryFilters, canRead);
  const vendorList = vendorsQuery.data ?? {
    items: [],
    limit: VENDOR_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(vendorList.total / vendorList.limit));
  const currentPage = vendorList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetToFirstPage();
  }

  function handleStatusChange(value: "ALL" | VendorStatus) {
    setStatus(value);
    resetToFirstPage();
  }

  function handleCreate() {
    setEditingVendor(null);
    setIsFormOpen(true);
  }

  function handleEdit(vendor: Vendor) {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingVendor(null);
  }

  if (!canRead) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Procurement" title="Vendors">
          Manage supplier records used across RFQs, purchase orders, and
          invoices.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Vendor access unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Vendor management is available to company admins and
                  procurement users. Finance users can view vendors in read-only
                  mode.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          canManage ? (
            <Button onClick={handleCreate}>
              <Plus className="size-4" />
              Create Vendor
            </Button>
          ) : null
        }
        eyebrow="Procurement"
        title="Vendors"
      >
        Manage supplier records used across RFQs, purchase orders, and invoices.
      </PageHeader>

      {!canManage ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            You can view vendors, but only company admins and procurement users
            can create, edit, or delete them.
          </CardContent>
        </Card>
      ) : null}

      <VendorFilters
        isDisabled={vendorsQuery.isLoading}
        resultCount={vendorList.items.length}
        search={search}
        status={status}
        totalCount={vendorList.total}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <VendorsTable
        canManage={canManage}
        error={vendorsQuery.error}
        isError={vendorsQuery.isError}
        isLoading={vendorsQuery.isLoading}
        vendors={vendorList.items}
        onDelete={setDeletingVendor}
        onEdit={handleEdit}
      />

      {!vendorsQuery.isLoading &&
      !vendorsQuery.isError &&
      vendorList.total > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              size="sm"
              variant="outline"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <VendorFormDrawer
        isOpen={isFormOpen}
        vendor={editingVendor}
        onClose={handleCloseForm}
      />

      <DeleteVendorDialog
        vendor={deletingVendor}
        onClose={() => setDeletingVendor(null)}
      />
    </div>
  );
}
