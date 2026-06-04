import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-ink text-white hover:bg-neutral-800",
    accent: "bg-mint text-white hover:bg-emerald-700",
    secondary: "border border-line bg-white text-ink hover:bg-neutral-50",
    ghost: "text-neutral-600 hover:bg-neutral-100",
  };

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
