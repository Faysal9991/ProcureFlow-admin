import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-[0_1px_2px_rgb(16_24_40/0.04)] outline-none transition-all duration-200 ease-out placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
          className,
        )}
        {...props}
      />
    );
  },
);
