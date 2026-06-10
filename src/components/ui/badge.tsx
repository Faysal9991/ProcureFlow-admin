import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const badgeVariants = {
  default: "border-border bg-muted text-foreground",
  error: "border-error/20 bg-error/10 text-error",
  info: "border-info/20 bg-info/10 text-info",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
