"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Clock, UserPlus, X } from "lucide-react";

type AppNotification = {
  id: string;
  type: "expiry_today" | "expiry_soon" | "new_member" | "payment_pending";
  title: string;
  body: string;
  href: string;
  createdAt: string;
};

const iconMap = {
  expiry_today: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
  expiry_soon: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  new_member: { icon: UserPlus, color: "text-mint", bg: "bg-mint/10" },
  payment_pending: { icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
};

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      } catch {
        // silencieux
      }
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Fermer en cliquant hors du dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifications.filter((n) => !read.has(n.id)).length;

  function markAllRead() {
    setRead(new Set(notifications.map((n) => n.id)));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-9 items-center justify-center rounded-md border border-line bg-white text-neutral-600 transition hover:bg-neutral-50"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-mint" />
              <p className="text-sm font-semibold">Notifications</p>
              {unread > 0 && (
                <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-semibold text-mint hover:underline"
                >
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex size-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <CheckCircle2 size={28} className="text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-500">Tout est en ordre</p>
                <p className="text-xs text-neutral-400">Aucune alerte en ce moment.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon: Icon, color, bg } = iconMap[n.type];
                const isUnread = !read.has(n.id);
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => {
                      setRead((prev) => new Set([...prev, n.id]));
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 transition hover:bg-paper ${isUnread ? "bg-mint/3" : ""}`}
                  >
                    <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                      <Icon size={15} className={color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-neutral-700">{n.title}</p>
                        {isUnread && (
                          <span className="size-1.5 shrink-0 rounded-full bg-mint" />
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium">{n.body}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-line px-4 py-2.5">
              <Link
                href="/subscriptions"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-mint hover:underline"
              >
                Voir tous les abonnements →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
