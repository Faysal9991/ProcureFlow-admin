"use client";

import { Save, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/client";
import type { CompanyRole, Permission } from "../types";
import {
  formatPermissionAction,
  getRoleMutationError,
  groupPermissions,
  isCompanyAdminTemplate,
  rolePermissionIds,
} from "../utils";
import { useReplaceRolePermissions } from "../hooks";

type PermissionMatrixProps = {
  canManage: boolean;
  permissions: Permission[];
  role: CompanyRole;
};

export function PermissionMatrix({
  canManage,
  permissions,
  role,
}: PermissionMatrixProps) {
  const defaultPermissionIds = useMemo(() => rolePermissionIds(role), [role]);
  const [draftPermissions, setDraftPermissions] = useState<{
    permissionIds: string[];
    roleId: string;
  } | null>(null);
  const [apiError, setApiError] = useState("");
  const mutation = useReplaceRolePermissions();
  const permissionGroups = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );
  const validPermissionIds = useMemo(
    () => new Set(permissions.map((permission) => permission.id)),
    [permissions],
  );
  const isProtected = isCompanyAdminTemplate(role);
  const isReadOnly = !canManage || isProtected;
  const selectedPermissionIds =
    draftPermissions?.roleId === role.id
      ? draftPermissions.permissionIds
      : defaultPermissionIds;

  function handlePermissionToggle(permissionId: string, checked: boolean) {
    setDraftPermissions((currentDraft) => {
      const current =
        currentDraft?.roleId === role.id
          ? currentDraft.permissionIds
          : defaultPermissionIds;

      if (checked) {
        return {
          permissionIds: Array.from(new Set([...current, permissionId])),
          roleId: role.id,
        };
      }

      return {
        permissionIds: current.filter((item) => item !== permissionId),
        roleId: role.id,
      };
    });
  }

  function handleGroupToggle(groupPermissions: Permission[], checked: boolean) {
    const groupIds = groupPermissions.map((permission) => permission.id);

    setDraftPermissions((currentDraft) => {
      const current =
        currentDraft?.roleId === role.id
          ? currentDraft.permissionIds
          : defaultPermissionIds;

      if (checked) {
        return {
          permissionIds: Array.from(new Set([...current, ...groupIds])),
          roleId: role.id,
        };
      }

      return {
        permissionIds: current.filter((item) => !groupIds.includes(item)),
        roleId: role.id,
      };
    });
  }

  function handleSave() {
    setApiError("");
    const permissionIds = selectedPermissionIds.filter((id) =>
      validPermissionIds.has(id),
    );

    mutation.mutate(
      {
        id: role.id,
        payload: { permissionIds },
      },
      {
        onError: (error) => {
          setApiError(getRoleMutationError(getApiErrorMessage(error)));
        },
        onSuccess: () => {
          setApiError("");
          setDraftPermissions(null);
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Permission Matrix</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the permission keys this company role should grant.
          </p>
        </div>
        {!isReadOnly ? (
          <Button isLoading={mutation.isPending} onClick={handleSave}>
            <Save className="size-4" />
            Save Permissions
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isProtected ? (
          <div className="mb-4 flex gap-3 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Company Admin keeps the full permission catalog. Deactivate or
              reduce this role only in backend code if a future policy requires
              it.
            </p>
          </div>
        ) : null}

        {!canManage ? (
          <div className="mb-4 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
            Role permissions are read-only for your account.
          </div>
        ) : null}

        {apiError ? (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {apiError}
          </div>
        ) : null}

        <div className="space-y-4">
          {permissionGroups.map((group) => {
            const groupIds = group.permissions.map((permission) => permission.id);
            const selectedInGroup = groupIds.filter((id) =>
              selectedPermissionIds.includes(id),
            );
            const isGroupChecked =
              selectedInGroup.length === groupIds.length && groupIds.length > 0;

            return (
              <section
                key={group.group}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {group.group}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedInGroup.length} of {groupIds.length} enabled
                    </p>
                  </div>
                  {!isReadOnly ? (
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        checked={isGroupChecked}
                        className="size-4 accent-primary"
                        type="checkbox"
                        onChange={(event) =>
                          handleGroupToggle(
                            group.permissions,
                            event.target.checked,
                          )
                        }
                      />
                      Select group
                    </label>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {group.permissions.map((permission) => {
                    const isChecked = selectedPermissionIds.includes(
                      permission.id,
                    );

                    return (
                      <label
                        key={permission.id}
                        className="flex gap-3 rounded-lg border border-border bg-surface p-3 text-sm"
                      >
                        <input
                          checked={isChecked}
                          className="mt-0.5 size-4 accent-primary"
                          disabled={isReadOnly || mutation.isPending}
                          type="checkbox"
                          onChange={(event) =>
                            handlePermissionToggle(
                              permission.id,
                              event.target.checked,
                            )
                          }
                        />
                        <span>
                          <span className="block font-medium text-foreground">
                            {permission.name || formatPermissionAction(permission)}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {permission.key}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
