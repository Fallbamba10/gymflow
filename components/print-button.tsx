"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white shadow-sm print:hidden"
      onClick={() => window.print()}
      type="button"
    >
      <Printer size={18} />
      Imprimer
    </button>
  );
}
