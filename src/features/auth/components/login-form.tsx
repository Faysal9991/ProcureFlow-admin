"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { useAuthStore } from "@/store/auth-store";
import { login } from "../api";
import { getAuthenticatedRedirectPath } from "../redirects";
import { loginSchema, type LoginFormValues } from "../schemas";

export function LoginForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRevalidating = useAuthStore((state) => state.isRevalidating);
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onError: (error) => {
      setApiError(getApiErrorMessage(error));
    },
    onSuccess: (session) => {
      setApiError("");
      setSession({
        accessToken: session.accessToken,
        user: session.user,
      });
      router.replace(getAuthenticatedRedirectPath(session.user));
    },
  });

  useEffect(() => {
    if (!hasHydrated || isRevalidating || !isAuthenticated || !user) {
      return;
    }

    router.replace(getAuthenticatedRedirectPath(user));
  }, [hasHydrated, isAuthenticated, isRevalidating, router, user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your admin account credentials.</CardDescription>
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
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                className="pl-9"
                aria-invalid={!!errors.email}
                autoComplete="email"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-sm text-error">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                className="pl-9"
                aria-invalid={!!errors.password}
                autoComplete="current-password"
                {...register("password")}
              />
            </div>
            {errors.password ? (
              <p className="text-sm text-error">{errors.password.message}</p>
            ) : null}
          </div>

          <Button
            className="w-full"
            isLoading={mutation.isPending}
            type="submit"
          >
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
