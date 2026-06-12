"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

type ToastState = {
  id: number;
  type: "success" | "error";
  message: string;
};

export function ToastProvider() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const counterRef = useRef(0);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (!success && !error) return;

    const key = `${pathname}:${success ?? ""}:${error ?? ""}`;
    if (seenRef.current.has(key)) return;
    seenRef.current.add(key);

    const id = ++counterRef.current;

    if (success) {
      setToasts((prev) => [...prev, { id, type: "success", message: success }]);
    } else if (error) {
      setToasts((prev) => [...prev, { id, type: "error", message: error }]);
    }

    // Nettoyer les params de l'URL sans recharger la page
    const next = new URLSearchParams(searchParams.toString());
    next.delete("success");
    next.delete("error");
    const query = next.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [searchParams, pathname, router]);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div
      className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.type === "error" ? 6000 : 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.type, onDismiss]);

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`flex w-full max-w-sm items-start gap-3 rounded-md border px-4 py-3.5 shadow-soft transition-all ${
        isSuccess
          ? "border-emerald-200 bg-white text-ink"
          : "border-red-200 bg-white text-ink"
      }`}
      style={{ animation: "toastIn 0.2s ease-out" }}
      role="alert"
    >
      <div
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
          isSuccess ? "bg-emerald-100 text-mint" : "bg-red-100 text-danger"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={13} />
        ) : (
          <AlertTriangle size={13} />
        )}
      </div>
      <p className="flex-1 text-sm font-semibold leading-5">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 shrink-0 text-neutral-400 transition hover:text-neutral-700"
        aria-label="Fermer"
      >
        <X size={15} />
      </button>
    </div>
  );
}
