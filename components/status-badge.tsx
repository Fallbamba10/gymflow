import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  tone: "active" | "warning" | "expired" | "neutral";
  children: React.ReactNode;
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  const tones = {
    active: "bg-emerald-500/15 text-emerald-400",
    warning: "bg-amber-500/15 text-amber-400",
    expired: "bg-red-500/15 text-red-400",
    neutral: "bg-white/8 text-white/40",
  };

  return (
    <span className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
