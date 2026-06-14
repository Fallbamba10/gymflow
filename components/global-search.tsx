"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Banknote, Loader2, Search, UserRound, X } from "lucide-react";

type MemberResult = {
  id: string;
  member_number: number;
  full_name: string;
  phone: string | null;
  plan: string | null;
  status: string;
};

type PaymentResult = {
  id: string;
  amount: number;
  paid_at: string;
  member_id: string | null;
  member_name: string;
};

type SearchResults = {
  members: MemberResult[];
  payments: PaymentResult[];
};

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " F";
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(iso));
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as SearchResults;
        setResults(data);
        setOpen(true);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function clear() {
    setQuery("");
    setResults(null);
    setOpen(false);
    inputRef.current?.focus();
  }

  const hasResults = results && (results.members.length > 0 || results.payments.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results && query.length >= 2) setOpen(true); }}
          placeholder="Rechercher…"
          className="h-9 w-full rounded-md border border-line bg-paper pl-9 pr-8 text-sm outline-none focus:border-mint focus:bg-white"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-neutral-400" size={14} />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border border-line bg-white shadow-md">
          {hasResults ? (
            <>
              {results.members.length > 0 && (
                <div>
                  <p className="border-b border-line bg-paper px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                    Membres
                  </p>
                  {results.members.map((m) => (
                    <Link
                      key={m.id}
                      href={`/members/${m.id}`}
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-neutral-50"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-paper text-neutral-500">
                        <UserRound size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{m.full_name}</p>
                        <p className="truncate text-xs text-neutral-400">
                          #{String(m.member_number).padStart(6, "0")}{m.plan ? ` · ${m.plan}` : ""}{m.phone ? ` · ${m.phone}` : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          m.status === "active" ? "bg-emerald-50 text-mint" : "bg-neutral-100 text-neutral-400"
                        }`}
                      >
                        {m.status === "active" ? "Actif" : "Expiré"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {results.payments.length > 0 && (
                <div>
                  <p className="border-b border-line bg-paper px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                    Paiements récents
                  </p>
                  {results.payments.map((p) => (
                    <Link
                      key={p.id}
                      href={p.member_id ? `/members/${p.member_id}` : `/payments/${p.id}/receipt`}
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-neutral-50"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-paper text-neutral-500">
                        <Banknote size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{p.member_name}</p>
                        <p className="text-xs text-neutral-400">{formatDate(p.paid_at)}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{formatAmount(p.amount)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-neutral-400">Aucun résultat pour « {query} »</p>
          )}
          <div className="border-t border-line bg-paper px-3 py-1.5">
            <p className="text-[10px] text-neutral-400">
              <kbd className="rounded bg-neutral-200 px-1 py-0.5 text-[9px] font-mono">⌘K</kbd> pour ouvrir · <kbd className="rounded bg-neutral-200 px-1 py-0.5 text-[9px] font-mono">Esc</kbd> pour fermer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
