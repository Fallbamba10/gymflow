import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
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
  const featuredPlan = page.plans[0] ?? null;
  const planCountLabel = page.plans.length > 1 ? "formules" : "formule";

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section
        className="relative overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(105deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.78) 46%, rgba(10,10,10,0.28) 100%), url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=88')",
        }}
      >
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
          <Link href="/site" className="flex items-center gap-3">
            <BrandMark inverse />
            <span className="text-lg font-semibold">GymFlow</span>
          </Link>
          <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md border border-white/30 px-4 text-sm font-semibold transition hover:bg-white/10">
            Connexion
          </Link>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(92vh-80px)] max-w-7xl gap-8 px-4 pb-8 pt-10 md:px-8 lg:grid-cols-[1fr_390px] lg:items-end">
          <div className="max-w-4xl py-10">
            <p className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/76 backdrop-blur">
              <Sparkles size={14} />
              Salle selectionnee
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              {page.gym.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
              Une adresse sportive presentee avec clarte : formules, contact et informations essentielles avant de te deplacer.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/82">
              <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                <MapPin size={16} />
                {page.gym.address ?? "Adresse a venir"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                <Phone size={16} />
                {page.gym.phone ?? "Telephone a venir"}
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {phoneHref ? (
                <Link href={phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold transition hover:bg-emerald-700">
                  Appeler la salle
                  <ArrowRight size={17} />
                </Link>
              ) : null}
              <a href="#formules" className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 px-5 text-sm font-semibold transition hover:bg-white/10">
                Voir les formules
              </a>
            </div>
          </div>

          <aside className="mb-4 rounded-md border border-white/18 bg-white p-5 text-ink shadow-soft backdrop-blur">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="text-sm font-semibold text-mint">Accueil prive</p>
                <h2 className="mt-1 text-xl font-semibold">Informations</h2>
              </div>
              <ShieldCheck className="text-mint" size={23} />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Formules</p>
                <p className="mt-2 text-lg font-semibold">
                  {page.plans.length} {planCountLabel}
                </p>
              </div>
              {featuredPlan ? (
                <div className="rounded-md bg-ink p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">Premier tarif</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(featuredPlan.price)}</p>
                  <p className="mt-1 text-sm text-white/62">{featuredPlan.name}</p>
                </div>
              ) : null}
              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Contact direct</p>
                <p className="mt-2 font-semibold">{page.gym.phone ?? "-"}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="formules" className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-mint">Formules</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
                Choisis le rythme qui te ressemble.
              </h2>
            </div>
            <p className="text-sm leading-7 text-neutral-600 md:text-base">
              Les prix affiches viennent directement de la salle. Appelle avant de te deplacer pour confirmer les disponibilites et les offres en cours.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {page.plans.length > 0 ? (
              page.plans.map((plan, index) => {
                const highlighted = index === 0;

                return (
                  <article
                    key={plan.id}
                    className={`rounded-md border p-5 shadow-soft ${
                      highlighted ? "border-neutral-900 bg-ink text-white" : "border-line bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${highlighted ? "text-white/45" : "text-neutral-500"}`}>
                          {highlighted ? "Selection" : "Formule"}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">{plan.name}</h3>
                      </div>
                      <p className="text-right text-xl font-semibold">{formatCurrency(plan.price)}</p>
                    </div>

                    <div className="mt-6 grid gap-3">
                      <div className={`flex items-center gap-3 rounded-md p-3 ${highlighted ? "bg-white/10" : "bg-paper"}`}>
                        <CalendarDays size={18} className={highlighted ? "text-white" : "text-mint"} />
                        <p className="text-sm font-semibold">{formatDuration(plan.duration_days)}</p>
                      </div>
                      <div className={`flex items-center gap-3 rounded-md p-3 ${highlighted ? "bg-white/10" : "bg-paper"}`}>
                        <Users size={18} className={highlighted ? "text-white" : "text-mint"} />
                        <p className="text-sm font-semibold">{formatSessions(plan.sessions)}</p>
                      </div>
                    </div>

                    {phoneHref ? (
                      <Link
                        href={phoneHref}
                        className={`mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                          highlighted ? "bg-mint text-white hover:bg-emerald-700" : "bg-ink text-white hover:bg-neutral-800"
                        }`}
                      >
                        Demander cette formule
                        <ArrowRight size={16} />
                      </Link>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <div className="rounded-md border border-line bg-white p-6 text-sm text-neutral-600 shadow-soft">
                Les formules seront bientot publiees.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <div className="rounded-md border border-line bg-paper p-5">
            <MapPin className="text-mint" size={22} />
            <h3 className="mt-4 font-semibold">Adresse</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{page.gym.address ?? "Adresse a venir"}</p>
          </div>
          <div className="rounded-md border border-line bg-paper p-5">
            <Phone className="text-mint" size={22} />
            <h3 className="mt-4 font-semibold">Contact</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{page.gym.phone ?? "Telephone a venir"}</p>
          </div>
          <div className="rounded-md border border-line bg-paper p-5">
            <Clock3 className="text-mint" size={22} />
            <h3 className="mt-4 font-semibold">Avant de venir</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Confirme la formule, le tarif et les conditions directement avec la salle.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div
          className="mx-auto flex max-w-7xl flex-col gap-6 rounded-md bg-cover bg-center p-6 text-white shadow-soft md:p-8 lg:flex-row lg:items-end lg:justify-between"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(10,10,10,0.92), rgba(10,10,10,0.58)), url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=88')",
          }}
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-white/60">Pret a commencer</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{page.gym.name}</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Choisis une formule, contacte la salle, puis viens t&apos;entrainer dans les meilleures conditions.
            </p>
          </div>
          {phoneHref ? (
            <Link href={phoneHref} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold transition hover:bg-emerald-700">
              Appeler maintenant
              <Phone size={16} />
            </Link>
          ) : null}
        </div>
      </section>

      <footer className="border-t border-line px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-ink">{page.gym.name}</p>
          <Link href="/site" className="inline-flex items-center gap-2 font-semibold text-mint">
            Propulse par GymFlow
            <CheckCircle2 size={15} />
          </Link>
        </div>
      </footer>
    </main>
  );
}
