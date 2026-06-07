import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Phone, ShieldCheck, Sparkles, Users } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { formatCurrency, formatDuration, formatSessions } from "@/lib/demo-data";
import { getPublicGymPage } from "@/lib/supabase/queries";

type PublicGymPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicGymProfilePage({ params }: PublicGymPageProps) {
  const { id } = await params;
  const page = await getPublicGymPage(id);

  if (!page) {
    notFound();
  }

  const phoneHref = page.gym.phone ? `tel:${page.gym.phone.replace(/\s/g, "")}` : null;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-ink text-white">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
          <Link href="/site" className="flex items-center gap-3">
            <BrandMark inverse />
            <span className="text-lg font-semibold">GymFlow</span>
          </Link>
          <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md border border-white/30 px-4 text-sm font-semibold transition hover:bg-white/10">
            Connexion
          </Link>
        </header>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-14 pt-8 md:px-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white/80">
              <Sparkles size={16} />
              Salle partenaire GymFlow
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              {page.gym.name}
            </h1>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/78">
              <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
                <MapPin size={16} />
                {page.gym.address ?? "Adresse a venir"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
                <Phone size={16} />
                {page.gym.phone ?? "Telephone a venir"}
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {phoneHref ? (
                <Link href={phoneHref} className="inline-flex h-12 items-center justify-center rounded-md bg-mint px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  Appeler la salle
                </Link>
              ) : null}
              <a href="#formules" className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                Voir les formules
              </a>
            </div>
          </div>

          <div className="rounded-md border border-white/15 bg-white p-5 text-ink shadow-soft">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-sm font-semibold text-mint">Infos rapides</p>
                <h2 className="mt-1 text-xl font-semibold">Accueil membres</h2>
              </div>
              <ShieldCheck className="text-mint" size={23} />
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Formules actives</p>
                <p className="mt-2 text-lg font-semibold">{page.plans.length}</p>
              </div>
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Contact</p>
                <p className="mt-2 font-semibold">{page.gym.phone ?? "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="formules" className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-mint">Formules</p>
              <h2 className="mt-2 text-3xl font-semibold">Abonnements disponibles</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600">
              Les prix et disponibilites peuvent changer. Contacte la salle pour confirmer avant de te deplacer.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {page.plans.length > 0 ? (
              page.plans.map((plan) => (
                <article key={plan.id} className="rounded-md border border-line bg-white p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <p className="mt-2 text-sm text-neutral-500">{formatDuration(plan.duration_days)}</p>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(plan.price)}</p>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md bg-paper p-3">
                      <CalendarDays size={18} className="text-mint" />
                      <p className="mt-2 text-sm font-semibold">{formatDuration(plan.duration_days)}</p>
                    </div>
                    <div className="rounded-md bg-paper p-3">
                      <Users size={18} className="text-mint" />
                      <p className="mt-2 text-sm font-semibold">{formatSessions(plan.sessions)}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-md border border-line bg-white p-6 text-sm text-neutral-600 shadow-soft">
                Les formules seront bientot publiees.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{page.gym.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">{page.gym.address ?? "Adresse a venir"}</p>
          </div>
          {phoneHref ? (
            <Link href={phoneHref} className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white">
              Contacter
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
