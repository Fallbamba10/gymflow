/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  XCircle,
} from "lucide-react";
import { getMemberPortal } from "@/lib/supabase/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const portal = await getMemberPortal(id);
  if (!portal) return { title: "Membre introuvable · GymFlow" };
  return {
    title: `${portal.member.full_name} · ${portal.gym.name}`,
    description: `Fiche membre GymFlow — ${portal.gym.name}`,
    robots: "noindex",
  };
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(value));
}

function getDaysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
}

function getMemberNum(n: number) {
  return `#${String(n).padStart(6, "0")}`;
}

export default async function MemberPortalPage({ params }: Props) {
  const { id } = await params;
  const portal = await getMemberPortal(id);

  if (!portal) notFound();

  const { member, gym, subscription, checkins_count } = portal;
  const daysLeft = getDaysLeft(subscription?.expires_at ?? null);
  const isActive = subscription?.status === "active" && (daysLeft === null || daysLeft >= 0) && subscription.sessions_left !== 0;
  const memberSince = new Date(member.created_at).getFullYear();

  return (
    <div className="min-h-screen bg-paper font-sans">
      {/* Cover / gym header */}
      <div className="relative h-36 overflow-hidden bg-neutral-900 md:h-44">
        {gym.cover_image_url ? (
          <img src={gym.cover_image_url} alt={gym.name} className="h-full w-full object-cover opacity-60" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,#374151_0%,#111827_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">GymFlow</p>
          <h1 className="mt-0.5 text-lg font-semibold text-white">{gym.name}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-6">
        {/* Carte membre */}
        <div className="-mt-8 overflow-hidden rounded-xl border border-line bg-white shadow-md">
          <div className="flex items-center gap-4 p-5">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.full_name}
                className="size-16 rounded-full object-cover ring-2 ring-line"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-2xl font-bold text-neutral-400">
                {member.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{member.full_name}</p>
              <p className="mt-0.5 font-mono text-sm text-neutral-500">{getMemberNum(member.member_number)}</p>
              <p className="mt-1 text-xs text-neutral-400">Membre depuis {memberSince}</p>
            </div>
          </div>
        </div>

        {/* Statut abonnement */}
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className={isActive ? "text-mint" : "text-neutral-400"} />
              <h2 className="text-sm font-bold uppercase tracking-[0.07em] text-neutral-700">Abonnement</h2>
            </div>
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-mint">
                <CheckCircle2 size={13} />
                Actif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-danger">
                <XCircle size={13} />
                Inactif
              </span>
            )}
          </div>
          <div className="space-y-4 p-5">
            {subscription ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-neutral-500">Formule</p>
                    <p className="mt-1 font-semibold">{subscription.plan_name ?? "Abonnement"}</p>
                  </div>
                </div>

                {subscription.expires_at && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-neutral-500">Expire le</p>
                      <p className="mt-1 font-semibold">{formatDate(subscription.expires_at)}</p>
                    </div>
                    {daysLeft !== null && (
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Jours restants</p>
                        <p className={`mt-1 text-xl font-bold tabular-nums ${daysLeft <= 3 ? "text-danger" : daysLeft <= 7 ? "text-amber" : "text-mint"}`}>
                          {Math.max(daysLeft, 0)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {subscription.sessions_left !== null && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-neutral-500">Séances restantes</p>
                      <p className={`mt-1 text-xl font-bold tabular-nums ${subscription.sessions_left <= 2 ? "text-amber" : "text-ink"}`}>
                        {subscription.sessions_left}
                      </p>
                    </div>
                  </div>
                )}

                {/* Barre de jours restants */}
                {daysLeft !== null && subscription.expires_at && (
                  (() => {
                    const starts = new Date(member.created_at);
                    const expires = new Date(subscription.expires_at!);
                    const total = Math.max((expires.getTime() - starts.getTime()) / 86400000, 1);
                    const pct = Math.min(Math.max((daysLeft / total) * 100, 0), 100);
                    return (
                      <div>
                        <div className="flex justify-between text-[11px] text-neutral-400 mb-1.5">
                          <span>Progression</span>
                          <span>{Math.round(pct)}% restant</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-paper">
                          <div
                            className={`h-full rounded-full transition-all ${pct > 40 ? "bg-mint" : pct > 15 ? "bg-amber" : "bg-danger"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()
                )}
              </>
            ) : (
              <p className="text-sm text-neutral-500">Aucun abonnement actif. Contactez votre salle pour renouveler.</p>
            )}
          </div>
        </div>

        {/* Stats membre */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
            <Activity size={18} className="text-mint" />
            <p className="mt-3 text-2xl font-bold tabular-nums">{checkins_count}</p>
            <p className="mt-1 text-xs text-neutral-500">Entrées total</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
            <Star size={18} className="text-amber" />
            <p className="mt-3 text-2xl font-bold tabular-nums">{memberSince}</p>
            <p className="mt-1 text-xs text-neutral-500">Membre depuis</p>
          </div>
        </div>

        {/* Contact gym */}
        {(gym.address || gym.phone) && (
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white shadow-soft">
            <div className="border-b border-line px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.07em] text-neutral-500">Votre salle</p>
            </div>
            <div className="space-y-3 p-5">
              {gym.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-neutral-400" />
                  <span className="text-neutral-700">{gym.address}</span>
                </div>
              )}
              {gym.phone && (
                <a href={`tel:${gym.phone}`} className="flex items-center gap-3 text-sm font-semibold text-mint transition hover:underline">
                  <Phone size={16} className="shrink-0" />
                  {gym.phone}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <Clock3 size={13} />
          <span>Mis à jour en temps réel · Powered by GymFlow</span>
        </div>
      </div>
    </div>
  );
}
