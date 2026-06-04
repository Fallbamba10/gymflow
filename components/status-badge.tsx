import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  tone: "active" | "warning" | "expired" | "neutral";
  children: React.ReactNode;
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  const tones = {
    active: "bg-emerald-50 text-mint",
    warning: "bg-amber-50 text-amber",
    expired: "bg-red-50 text-danger",
    neutral: "bg-neutral-100 text-neutral-600",
  };

  return (
    <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

