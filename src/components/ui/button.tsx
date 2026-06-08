import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = {
  danger: "bg-error text-white hover:bg-error/90 focus-visible:ring-error/20",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  outline:
    "border border-border bg-surface text-foreground hover:bg-muted hover:text-foreground",
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary:
    "bg-muted text-foreground hover:bg-border focus-visible:ring-muted-foreground/20",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  icon: "size-10 p-0",
  sm: "h-9 px-3",
};

type ButtonStyleOptions = {
  className?: string;
  size?: keyof typeof buttonSizes;
  variant?: keyof typeof buttonVariants;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  isLoading?: boolean;
  size?: keyof typeof buttonSizes;
  variant?: keyof typeof buttonVariants;
};

export function getButtonClassName({
  className,
  size = "default",
  variant = "primary",
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );
}

export function Button({
  children,
  className,
  disabled,
  icon,
  isLoading = false,
  size = "default",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName({ className, size, variant })}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
