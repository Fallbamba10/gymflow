"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Activity, Banknote, CreditCard, LayoutDashboard, LogOut, Menu, Settings, UserCheck, Users, UsersRound, X } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { BrandMark } from "@/components/brand-mark";
import { ToastProvider } from "@/components/toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Membres", href: "/members", icon: Users, adminOnly: true },
  { label: "Abonnements", href: "/subscriptions", icon: CreditCard, adminOnly: true },
  { label: "Caisse", href: "/payments", icon: Banknote, adminOnly: true },
  { label: "Pointage", href: "/checkin", icon: UserCheck },
  { label: "Analytics", href: "/analytics", icon: Activity, adminOnly: true },
  { label: "Equipe", href: "/team", icon: UsersRound, adminOnly: true },
  { label: "Parametres", href: "/settings", icon: Settings, adminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [gymName, setGymName] = useState("Salle");
  const [role, setRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadGym() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("gym_users")
          .select("role, gyms(name)")
          .eq("user_id", user.id)
          .eq("active", true)
          .limit(1)
          .single();

        const gym = Array.isArray(data?.gyms) ? data?.gyms[0] : data?.gyms;
        if (mounted && gym?.name) {
          setGymName(gym.name);
          setRole(data?.role ?? null);
        }
      } catch {
        // Keep the current label if the gym cannot be loaded.
      }
    }

    loadGym();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const visibleNavItems = navItems.filter((item) => {
    if (!role) return item.href === "/" || item.href === "/checkin";
    return !item.adminOnly || role === "admin";
  });
  const roleLabel = role === "admin" ? "Admin" : role === "operator" ? "Operateur" : null;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <div className="min-w-0">
              <p className="text-base font-semibold leading-none">GymFlow</p>
              <p className="mt-1 truncate text-sm text-neutral-500">{gymName}</p>
            </div>
          </Link>
          <button
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-line bg-white text-ink"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-x-0 top-[65px] z-30 border-b border-line bg-white px-4 py-4 shadow-soft lg:hidden">
          <nav className="grid gap-2">
            {visibleNavItems.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                    active ? "bg-ink text-white" : "border border-line bg-white text-neutral-700",
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action={signOut} className="mt-4">
            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line bg-paper px-3 text-sm font-semibold text-neutral-700">
              <LogOut size={17} />
              Deconnexion
            </button>
          </form>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-5 py-6 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-lg font-semibold leading-none">GymFlow</p>
            <p className="mt-1 text-sm text-neutral-500">{gymName}</p>
            {roleLabel ? <p className="mt-0.5 text-xs font-medium text-mint">{roleLabel}</p> : null}
          </div>
        </Link>

        <nav className="mt-10 space-y-1">
          {visibleNavItems.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  active
                    ? "bg-ink text-white"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 space-y-2">
          <form action={signOut}>
            <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50">
              <LogOut size={16} />
              Deconnexion
            </button>
          </form>
        </div>
      </aside>

      <section className="lg:pl-64">{children}</section>

      <Suspense>
        <ToastProvider />
      </Suspense>
    </main>
  );
}
