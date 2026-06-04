"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Banknote, CreditCard, Dumbbell, LayoutDashboard, LogOut, Settings, UserCheck, Users } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Membres", href: "/members", icon: Users },
  { label: "Abonnements", href: "/subscriptions", icon: CreditCard },
  { label: "Caisse", href: "/payments", icon: Banknote },
  { label: "Pointage", href: "/checkin", icon: UserCheck },
  { label: "Parametres", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [gymName, setGymName] = useState("Salle Plateau");
  const [role, setRole] = useState<string | null>(null);

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
        // Keep demo fallback when Supabase is unavailable.
      }
    }

    loadGym();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-5 py-6 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-ink text-white">
            <Dumbbell size={20} />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">GymFlow</p>
            <p className="mt-1 text-sm text-neutral-500">{gymName}</p>
            {role ? <p className="mt-0.5 text-xs font-medium text-mint">{role}</p> : null}
          </div>
        </Link>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => {
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
    </main>
  );
}
