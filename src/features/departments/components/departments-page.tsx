"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useDepartments } from "../hooks";
import type { Department, DepartmentStatus } from "../types";
import { DEPARTMENT_PAGE_SIZE, filterDepartments } from "../utils";
import { DeleteDepartmentDialog } from "./delete-department-dialog";
import { DepartmentFilters } from "./department-filters";
import { DepartmentFormDrawer } from "./department-form";
import { DepartmentsTable } from "./departments-table";

export function DepartmentsPage() {
  const user = useAuthStore((state) => state.user);
  const canWrite = user?.role === "COMPANY_ADMIN";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | DepartmentStatus>("ALL");
  const [page, setPage] = useState(1);
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const departmentsQuery = useDepartments();
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );
  const filteredDepartments = useMemo(
    () => filterDepartments({ departments, search, status }),
    [departments, search, status],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / DEPARTMENT_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleDepartments = filteredDepartments.slice(
    (currentPage - 1) * DEPARTMENT_PAGE_SIZE,
    currentPage * DEPARTMENT_PAGE_SIZE,
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: "ALL" | DepartmentStatus) {
    setStatus(value);
    setPage(1);
  }

  function handleCreate() {
    setEditingDepartment(null);
    setIsFormOpen(true);
  }

  function handleEdit(department: Department) {
    setEditingDepartment(department);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingDepartment(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          canWrite ? (
            <Button onClick={handleCreate}>
              <Plus className="size-4" />
              Create Department
            </Button>
          ) : null
        }
        eyebrow="Organization"
        title="Departments"
      >
        Manage departments used for reporting, ownership, and procurement
        workflow routing.
      </PageHeader>

      {!canWrite ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            You can view departments, but only company admins can create, edit,
            or delete them.
          </CardContent>
        </Card>
      ) : null}

      <DepartmentFilters
        resultCount={filteredDepartments.length}
        search={search}
        status={status}
        totalCount={departments.length}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <DepartmentsTable
        canWrite={canWrite}
        departments={visibleDepartments}
        error={departmentsQuery.error}
        isError={departmentsQuery.isError}
        isLoading={departmentsQuery.isLoading}
        onDelete={setDeletingDepartment}
        onEdit={handleEdit}
      />

      {!departmentsQuery.isLoading &&
      !departmentsQuery.isError &&
      filteredDepartments.length > 0 ? (
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

      <DepartmentFormDrawer
        department={editingDepartment}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />

      <DeleteDepartmentDialog
        department={deletingDepartment}
        onClose={() => setDeletingDepartment(null)}
      />
    </div>
  );
}
