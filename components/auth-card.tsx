import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const features = [
  { label: "Pointage QR", sub: "Entrée en 1 seconde" },
  { label: "Caisse propre", sub: "Cash, Wave, Orange Money" },
  { label: "Analytics", sub: "Heures de pointe en direct" },
  { label: "WhatsApp", sub: "Rappels automatiques" },
];

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Photo de fond */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2400&q=88')",
          opacity: 0.18,
        }}
      />
      {/* Dégradé */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#080808]/95 via-[#080808]/75 to-[#080808]/95" />
      {/* Glow émeraude */}
      <div className="pointer-events-none fixed left-[20%] top-[35%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Barre de nav */}
        <header className="flex items-center justify-between px-6 py-5 md:px-12">
          <Link href="/site" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white">
              <Zap size={15} className="text-[#080808]" fill="currentColor" />
            </div>
            <span className="text-sm font-semibold tracking-tight">GymFlow</span>
          </Link>
          <Link
            href="/site"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/35 transition hover:text-white/65"
          >
            <ArrowLeft size={13} />
            Retour
          </Link>
        </header>

        {/* Corps */}
        <div className="flex flex-1 items-center px-6 py-10 md:px-12">
          <div className="mx-auto grid w-full max-w-5xl gap-16 lg:grid-cols-[1fr_420px] lg:items-center">

            {/* Gauche — branding */}
            <div className="hidden lg:block">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/40 backdrop-blur">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Espace privé
              </div>

              <h2 className="text-[2.8rem] font-semibold leading-tight tracking-tight">
                Gère ta salle
                <br />
                <span className="text-emerald-400">avec précision.</span>
              </h2>

              <p className="mt-5 max-w-sm text-base leading-8 text-white/45">
                Pointage, caisse, membres et équipe — dans une interface pensée pour le terrain.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3">
                {features.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:border-white/15 hover:bg-white/5"
                  >
                    <p className="text-sm font-semibold">{f.label}</p>
                    <p className="mt-1 text-xs text-white/40">{f.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["M", "F", "K", "A"].map((l) => (
                    <div
                      key={l}
                      className="flex size-8 items-center justify-center rounded-full border-2 border-[#080808] bg-emerald-500/20 text-xs font-bold text-emerald-400"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/35">
                  50+ salles · Sénégal, Côte d&apos;Ivoire, Mali, Ghana
                </p>
              </div>
            </div>

            {/* Droite — carte formulaire */}
            <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              {/* En-tête */}
              <div className="relative overflow-hidden border-b border-white/8 px-8 py-6">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-white">
                    <Zap size={11} className="text-[#080808]" fill="currentColor" />
                  </div>
                  <span className="text-xs font-semibold text-white/40">GymFlow</span>
                </div>
                <h1 className="text-xl font-semibold">{title}</h1>
                <p className="mt-1 text-sm text-white/45">{subtitle}</p>
              </div>

              {/* Formulaire */}
              <div className="px-8 py-7">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
