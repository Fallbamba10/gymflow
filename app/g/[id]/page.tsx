import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin, Phone, ShieldCheck, Sparkles, Users } from "lucide-react";
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

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section
        className="relative min-h-[88vh] overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(12,12,12,0.9), rgba(12,12,12,0.58), rgba(12,12,12,0.18)), url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2200&q=85')",
        }}
      >
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
          <Link href="/site" className="flex items-center gap-3">
            <BrandMark inverse />
            <span className="text-lg font-semibold">GymFlow</span>
          </Link>
          <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md border border-white/30 px-4 text-sm font-semibold transition hover:bg-white/10">
            Connexion
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(88vh-80px)] max-w-6xl flex-col justify-end px-4 pb-10 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-end">
            <div className="max-w-4xl py-10">
              <p className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
                <Sparkles size={14} />
                Salle partenaire GymFlow
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
                {page.gym.name}
              </h1>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/82">
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
                  <Link href={phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    Appeler la salle
                    <ArrowRight size={17} />
                  </Link>
                ) : null}
                <a href="#formules" className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Voir les formules
                </a>
              </div>
            </div>

            <div className="mb-4 rounded-md border border-white/15 bg-white/95 p-5 text-ink shadow-soft backdrop-blur">
              <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="text-sm font-semibold text-mint">Accueil membres</p>
                  <h2 className="mt-1 text-xl font-semibold">Infos rapides</h2>
                </div>
                <ShieldCheck className="text-mint" size={23} />
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-md bg-paper p-4">
                  <p className="text-xs font-semibold uppercase text-neutral-500">Formules publiees</p>
                  <p className="mt-2 text-lg font-semibold">{page.plans.length}</p>
                </div>
                {featuredPlan ? (
                  <div className="rounded-md bg-paper p-4">
                    <p className="text-xs font-semibold uppercase text-neutral-500">A partir de</p>
                    <p className="mt-2 text-lg font-semibold">{formatCurrency(featuredPlan.price)}</p>
                    <p className="mt-1 text-sm text-neutral-500">{featuredPlan.name}</p>
                  </div>
                ) : null}
                <div className="rounded-md bg-paper p-4">
                  <p className="text-xs font-semibold uppercase text-neutral-500">Contact</p>
                  <p className="mt-2 font-semibold">{page.gym.phone ?? "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="formules" className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-mint">Formules</p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Choisis ton rythme.</h2>
            </div>
            <p className="text-sm leading-7 text-neutral-600">
              Les prix peuvent changer selon les offres en cours. Appelle la salle pour confirmer les disponibilites avant de te deplacer.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {page.plans.length > 0 ? (
              page.plans.map((plan, index) => (
                <article key={plan.id} className={`rounded-md border p-5 shadow-soft ${index === 0 ? "border-neutral-900 bg-ink text-white" : "border-line bg-white"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${index === 0 ? "text-white/45" : "text-neutral-500"}`}>
                        Formule
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{plan.name}</h3>
                      <p className={`mt-2 text-sm ${index === 0 ? "text-white/60" : "text-neutral-500"}`}>{formatDuration(plan.duration_days)}</p>
                    </div>
                    <p className="text-xl font-semibold">{formatCurrency(plan.price)}</p>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className={`rounded-md p-3 ${index === 0 ? "bg-white/10" : "bg-paper"}`}>
                      <CalendarDays size={18} className={index === 0 ? "text-white" : "text-mint"} />
                      <p className="mt-2 text-sm font-semibold">{formatDuration(plan.duration_days)}</p>
                    </div>
                    <div className={`rounded-md p-3 ${index === 0 ? "bg-white/10" : "bg-paper"}`}>
                      <Users size={18} className={index === 0 ? "text-white" : "text-mint"} />
                      <p className="mt-2 text-sm font-semibold">{formatSessions(plan.sessions)}</p>
                    </div>
                  </div>
                  {phoneHref ? (
                    <Link href={phoneHref} className={`mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${index === 0 ? "bg-mint text-white hover:bg-emerald-700" : "bg-ink text-white hover:bg-neutral-800"}`}>
                      Appeler pour cette formule
                      <ArrowRight size={16} />
                    </Link>
                  ) : null}
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

      <section className="border-t border-line bg-white px-4 py-12 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{page.gym.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">{page.gym.address ?? "Adresse a venir"}</p>
          </div>
          {phoneHref ? (
            <Link href={phoneHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white">
              Contacter
              <Phone size={16} />
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
