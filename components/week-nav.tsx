"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function WeekNav({ weekStart }: { weekStart: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function shift(days: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + days);
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", d.toISOString().slice(0, 10));
    router.push(`/classes?${params.toString()}`);
  }

  const monday = new Date(weekStart);
  const sunday = new Date(weekStart);
  sunday.setDate(sunday.getDate() + 6);

  const label = `${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => shift(-7)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-ink shadow-sm hover:bg-paper transition-colors"
      >
        <ChevronLeft size={15} />
      </button>
      <span className="text-sm font-medium text-ink min-w-[180px] text-center">{label}</span>
      <button
        type="button"
        onClick={() => shift(7)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-ink shadow-sm hover:bg-paper transition-colors"
      >
        <ChevronRight size={15} />
      </button>
      <button
        type="button"
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("week");
          router.push(`/classes?${params.toString()}`);
        }}
        className="ml-1 h-8 rounded-md border border-line bg-white px-3 text-xs font-medium text-muted shadow-sm hover:bg-paper hover:text-ink transition-colors"
      >
        Aujourd&apos;hui
      </button>
    </div>
  );
}
