"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { changePassword } from "../api";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas";
import { LogoutButton } from "./logout-button";

export function ChangePasswordForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onError: (error) => {
      setApiError(getApiErrorMessage(error));
    },
    onSuccess: () => {
      setApiError("");
      updateUser({ mustChangePassword: false });
      router.replace(
        user?.role === "SUPER_ADMIN" ? ROUTES.platformCompanies : ROUTES.dashboard,
      );
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Set a new password before continuing to the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          {apiError ? (
            <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {apiError}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="currentPassword"
                type="password"
                className="pl-9"
                aria-invalid={!!errors.currentPassword}
                autoComplete="current-password"
                {...register("currentPassword")}
              />
            </div>
            {errors.currentPassword ? (
              <p className="text-sm text-error">
                {errors.currentPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="newPassword"
                type="password"
                className="pl-9"
                aria-invalid={!!errors.newPassword}
                autoComplete="new-password"
                {...register("newPassword")}
              />
            </div>
            {errors.newPassword ? (
              <p className="text-sm text-error">{errors.newPassword.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                className="pl-9"
                aria-invalid={!!errors.confirmPassword}
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword ? (
              <p className="text-sm text-error">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="w-full sm:flex-1"
              isLoading={mutation.isPending}
              type="submit"
            >
              Update password
            </Button>
            <LogoutButton className="w-full sm:w-auto" variant="outline" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
