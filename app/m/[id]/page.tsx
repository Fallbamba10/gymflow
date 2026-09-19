/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Phone, XCircle } from "lucide-react";
import QRCode from "qrcode";
import { getMemberPortal } from "@/lib/supabase/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const portal = await getMemberPortal(id);
  if (!portal) return { title: "Membre introuvable · GymFlow" };
  return {
    title: `${portal.member.full_name} · ${portal.gym.name}`,
    description: `Carte membre GymFlow — ${portal.gym.name}`,
    robots: "noindex",
  };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function getDaysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
}

export default async function MemberPortalPage({ params }: Props) {
  const { id } = await params;
  const portal = await getMemberPortal(id);
  if (!portal) notFound();

  const { member, gym, subscription, checkins_count } = portal;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gymflow.app";
  const portalUrl = `${siteUrl}/m/${member.id}`;
  const memberNum = String(member.member_number).padStart(6, "0");

  const rawSvg = await QRCode.toString(portalUrl, {
    type: "svg",
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
    errorCorrectionLevel: "H",
    width: 240,
  });
  const qrSvg = rawSvg
    .replace(/width="\d+"/, 'width="100%"')
    .replace(/height="\d+"/, 'height="100%"');

  const daysLeft = getDaysLeft(subscription?.expires_at ?? null);
  const isActive =
    subscription?.status === "active" &&
    (daysLeft === null || daysLeft >= 0) &&
    subscription.sessions_left !== 0;

  const statusStyle = isActive
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-red-50 text-red-600 border-red-200";

  const expiryColor =
    daysLeft !== null && daysLeft <= 3
      ? "text-red-600"
      : daysLeft !== null && daysLeft <= 7
        ? "text-amber-600"
        : "text-slate-800";

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">

      {/* Header gym */}
      <div className="relative h-40 overflow-hidden bg-slate-900 md:h-52">
        {gym.cover_image_url ? (
          <img src={gym.cover_image_url} alt={gym.name} className="h-full w-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,#1e3a5f_0%,#0f172a_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">GymFlow</p>
            <h1 className="mt-1 text-xl font-bold text-white leading-tight">{gym.name}</h1>
          </div>
          {gym.phone && (
            <a
              href={`tel:${gym.phone}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Phone size={12} />
              {gym.phone}
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-sm px-4 pb-12">

        {/* Carte membre */}
        <div className="-mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

          {/* Identité */}
          <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.full_name}
                className="size-16 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-400">
                {member.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-slate-900">{member.full_name}</p>
              <p className="mt-0.5 font-mono text-sm text-slate-400">#{memberNum}</p>
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
                {isActive
                  ? <><CheckCircle2 size={11} /> Actif</>
                  : <><XCircle size={11} /> Inactif</>
                }
              </span>
            </div>
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-6">
            <div
              className="rounded-xl border-2 border-slate-200 bg-white p-3 shadow-sm"
              style={{ width: 180, height: 180 }}
              // biome-ignore lint: raw SVG from trusted library
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="text-center text-xs leading-relaxed text-slate-400">
              Présente ce code à l&apos;accueil<br />pour un pointage instantané
            </p>
          </div>

          {/* Abonnement */}
          <div className="space-y-3 px-5 py-4">
            {subscription ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Formule</p>
                  <p className="text-sm font-semibold text-slate-800">{subscription.plan_name ?? "Abonnement"}</p>
                </div>

                {subscription.expires_at && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Expire le</p>
                    <p className="text-sm font-semibold text-slate-800">{formatDate(subscription.expires_at)}</p>
                  </div>
                )}

                {daysLeft !== null && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Jours restants</p>
                    <p className={`text-sm font-bold tabular-nums ${expiryColor}`}>
                      {Math.max(daysLeft, 0)} j
                    </p>
                  </div>
                )}

                {subscription.sessions_left !== null && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Séances restantes</p>
                    <p className={`text-sm font-bold tabular-nums ${subscription.sessions_left <= 2 ? "text-amber-600" : "text-slate-800"}`}>
                      {subscription.sessions_left}
                    </p>
                  </div>
                )}

                {daysLeft !== null && (
                  <div className="pt-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          daysLeft > 10 ? "bg-emerald-500" : daysLeft > 3 ? "bg-amber-400" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(Math.max((daysLeft / 30) * 100, 4), 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="py-1 text-sm text-slate-500">
                Aucun abonnement actif. Contactez votre salle pour renouveler.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100">
            <div className="bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Entrées</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{checkins_count}</p>
            </div>
            <div className="bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Membre depuis</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                {new Date(member.created_at).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Adresse gym */}
        {gym.address && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-600">{gym.address}</p>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-slate-400">
          Powered by <span className="font-semibold text-slate-500">GymFlow</span>
        </p>
      </div>
    </div>
  );
}
