import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Users,
  Zap,
} from "lucide-react";

function IgIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
import { formatCurrency, formatDuration, formatSessions } from "@/lib/demo-data";
import { getPublicGymPage } from "@/lib/supabase/queries";

type PublicGymPageProps = {
  params: Promise<{ id: string }>;
};

function getWhatsAppHref(phone: string | null, gymName: string) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 9 && digits.startsWith("7")) digits = `221${digits}`;
  if (!digits) return null;
  const msg = encodeURIComponent(`Bonjour ${gymName}, je souhaite avoir des informations sur vos formules.`);
  return `https://wa.me/${digits}?text=${msg}`;
}

export default async function PublicGymProfilePage({ params }: PublicGymPageProps) {
  const { id } = await params;
  const page = await getPublicGymPage(id);
  if (!page) notFound();

  const { gym, plans } = page;
  const publicPhone = gym.whatsapp_phone || gym.phone;
  const phoneHref = gym.phone ? `tel:${gym.phone.replace(/\s/g, "")}` : null;
  const whatsappHref = getWhatsAppHref(publicPhone, gym.name);
  const coverImage =
    gym.cover_image_url ||
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=88";
  const description =
    gym.public_description ||
    `${gym.name} — une salle d'exception avec des formules adaptées à tous les niveaux.`;
  const publicHours = gym.public_hours || "Horaires à confirmer avec la salle";

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${coverImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-[#080808]/40 to-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/90 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Nav */}
          <header className="flex items-center justify-between px-6 py-6 md:px-12">
            <Link href="/site" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-white">
                <Zap size={15} className="text-[#080808]" fill="currentColor" />
              </div>
              <span className="text-sm font-semibold tracking-tight">GymFlow</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 text-xs font-semibold backdrop-blur transition hover:bg-white/10"
            >
              Connexion
              <ArrowRight size={13} />
            </Link>
          </header>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-end px-6 pb-16 md:px-12 lg:pb-24">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/50 backdrop-blur">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Salle partenaire GymFlow
              </div>

              <h1 className="text-6xl font-semibold leading-[1.05] tracking-tight md:text-8xl lg:text-[7rem]">
                {gym.name}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/55 md:text-lg">
                {description}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {gym.address && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                    <MapPin size={14} className="text-emerald-400" />
                    {gym.address}
                  </span>
                )}
                {gym.phone && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                    <Phone size={14} className="text-emerald-400" />
                    {gym.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                  <Clock3 size={14} className="text-emerald-400" />
                  {publicHours}
                </span>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center gap-2.5 rounded-full bg-emerald-500 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                  >
                    <MessageCircle size={17} />
                    Écrire sur WhatsApp
                  </a>
                )}
                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/15 bg-white/8 px-6 text-sm font-semibold backdrop-blur transition hover:bg-white/15"
                  >
                    <Phone size={17} />
                    Appeler
                  </a>
                )}
                <a
                  href="#formules"
                  className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/15 bg-white/8 px-6 text-sm font-semibold backdrop-blur transition hover:bg-white/15"
                >
                  Voir les formules
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>

            {plans.length > 0 && (
              <div className="mt-16 flex flex-wrap gap-px overflow-hidden rounded-2xl border border-white/8">
                {[
                  { label: "Formules disponibles", value: plans.length.toString() },
                  {
                    label: "À partir de",
                    value: formatCurrency(Math.min(...plans.map((p) => p.price))),
                  },
                  { label: "Contact direct", value: gym.phone || "Sur place" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-1 flex-col gap-1 bg-white/5 px-6 py-4 backdrop-blur"
                  >
                    <p className="text-xs text-white/40">{stat.label}</p>
                    <p className="text-lg font-semibold tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── FORMULES ─────────────────────────────────────────────── */}
      <section id="formules" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">

          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
                Tarifs & Formules
              </p>
              <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
                Choisis ton rythme.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/45">
              Les tarifs sont fixés directement par la salle. Contacte-nous pour toute question ou offre spéciale.
            </p>
          </div>

          {plans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan, i) => {
                const featured = i === 0;
                return (
                  <article
                    key={plan.id}
                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                      featured
                        ? "border-emerald-500/30 bg-gradient-to-b from-emerald-950/60 to-[#0f0f0f]"
                        : "border-white/8 bg-white/3 hover:border-white/15"
                    }`}
                  >
                    {featured && (
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {featured && (
                            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                              <span className="size-1.5 rounded-full bg-emerald-400" />
                              Recommandée
                            </span>
                          )}
                          <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                        </div>
                        <p className="text-2xl font-semibold tracking-tight">
                          {formatCurrency(plan.price)}
                        </p>
                      </div>

                      <div className="mt-6 space-y-2">
                        <div className={`flex items-center gap-3 rounded-xl p-3 ${featured ? "bg-white/5" : "bg-white/3"}`}>
                          <div className={`flex size-8 items-center justify-center rounded-lg ${featured ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/50"}`}>
                            <CalendarDays size={15} />
                          </div>
                          <p className="text-sm font-medium">{formatDuration(plan.duration_days)}</p>
                        </div>
                        <div className={`flex items-center gap-3 rounded-xl p-3 ${featured ? "bg-white/5" : "bg-white/3"}`}>
                          <div className={`flex size-8 items-center justify-center rounded-lg ${featured ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/50"}`}>
                            <Users size={15} />
                          </div>
                          <p className="text-sm font-medium">{formatSessions(plan.sessions)}</p>
                        </div>
                      </div>

                      {(whatsappHref || phoneHref) && (
                        <a
                          href={whatsappHref ?? phoneHref ?? "#"}
                          target={whatsappHref ? "_blank" : undefined}
                          rel={whatsappHref ? "noreferrer" : undefined}
                          className={`mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                            featured
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                              : "border border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          Souscrire à cette formule
                          {whatsappHref ? <MessageCircle size={15} /> : <ArrowRight size={15} />}
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center text-sm text-white/40">
              Les formules seront bientôt publiées.
            </div>
          )}
        </div>
      </section>

      {/* ─── CONTACT ──────────────────────────────────────────────── */}
      <section className="border-y border-white/6 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
            Nous contacter
          </p>
          <h2 className="mb-12 text-4xl font-semibold tracking-tight md:text-5xl">
            Viens nous voir.
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: MapPin, label: "Adresse", value: gym.address || "À confirmer" },
              { icon: Phone, label: "Téléphone", value: gym.phone || "À confirmer" },
              { icon: Clock3, label: "Horaires", value: publicHours },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <item.icon size={18} />
                </div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/35">
                  {item.label}
                </p>
                <p className="text-sm font-medium leading-6 text-white/80">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-full bg-emerald-500 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                <MessageCircle size={17} />
                WhatsApp
              </a>
            )}
            {phoneHref && (
              <a
                href={phoneHref}
                className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold transition hover:bg-white/10"
              >
                <Phone size={17} />
                Appeler
              </a>
            )}
            {gym.instagram_url && (
              <a
                href={gym.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold transition hover:bg-white/10"
              >
                <IgIcon size={17} />
                IgIcon
              </a>
            )}
            {gym.tiktok_url && (
              <a
                href={gym.tiktok_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold transition hover:bg-white/10"
              >
                <Music2 size={17} />
                TikTok
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-32 md:px-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=88')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
              Prêt à commencer ?
            </p>
            <h2 className="text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              {gym.name}.
            </h2>
            <p className="mt-6 text-base leading-8 text-white/50">
              Rejoins la salle, choisis ta formule, et commence à t&apos;entraîner dès demain.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-14 items-center gap-3 rounded-full bg-emerald-500 px-8 text-sm font-semibold text-white shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400"
                >
                  <MessageCircle size={18} />
                  Écrire sur WhatsApp
                </a>
              )}
              {phoneHref && !whatsappHref && (
                <a
                  href={phoneHref}
                  className="inline-flex h-14 items-center gap-3 rounded-full bg-emerald-500 px-8 text-sm font-semibold text-white shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400"
                >
                  <Phone size={18} />
                  Appeler maintenant
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="text-sm font-semibold text-white/60">{gym.name}</p>
          <Link
            href="/site"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/30 transition hover:text-white/60"
          >
            <CheckCircle2 size={13} className="text-emerald-400" />
            Propulsé par GymFlow
          </Link>
        </div>
      </footer>
    </main>
  );
}
