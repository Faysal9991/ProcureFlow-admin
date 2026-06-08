"use client";

import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { logout } from "../api";

type LogoutButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "icon" | "isLoading" | "onClick" | "type"
> & {
  showLabel?: boolean;
};

export function LogoutButton({ showLabel = true, ...props }: LogoutButtonProps) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const mutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession();
      router.replace(ROUTES.login);
    },
  });

  return (
    <Button
      type="button"
      icon={<LogOut className="size-4" />}
      isLoading={mutation.isPending}
      onClick={() => mutation.mutate()}
      {...props}
    >
      {showLabel ? "Logout" : null}
    </Button>
  );
}
