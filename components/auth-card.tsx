import { BrandMark } from "@/components/brand-mark";
import { ShieldCheck, Sparkles } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-ink px-4 py-8 text-white"
      style={{
        backgroundImage:
          "linear-gradient(115deg, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.82) 42%, rgba(10,10,10,0.58) 100%), url('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2200&q=85')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <section className="grid w-full gap-6 lg:grid-cols-[1fr_440px] lg:items-center">
          <div className="hidden max-w-2xl lg:block">
            <div className="flex items-center gap-3">
              <BrandMark inverse />
              <div>
                <p className="text-lg font-semibold leading-none">GymFlow</p>
                <p className="mt-1 text-sm text-white/60">Gestion de salle premium</p>
              </div>
            </div>

            <p className="mt-10 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 backdrop-blur">
              <Sparkles size={14} />
              Espace prive
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight">
              Connecte-toi a une salle geree avec calme, precision et style.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/68">
              Un acces clair pour piloter les membres, les paiements, le pointage et l&apos;equipe sans bruit inutile.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {["Pointage", "Caisse", "Membres"].map((item) => (
                <div key={item} className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <ShieldCheck className="text-mint" size={18} />
                  <p className="mt-3 text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full rounded-md border border-white/18 bg-white p-6 text-ink shadow-soft backdrop-blur md:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
              <div className="flex items-center gap-3">
                <BrandMark />
                <div>
                  <p className="text-lg font-semibold leading-none">GymFlow</p>
                  <p className="mt-1 text-sm text-neutral-500">Acces securise</p>
                </div>
              </div>
              <span className="rounded-md bg-ink px-3 py-1 text-xs font-semibold text-white">Prive</span>
            </div>

            <div className="mt-7">
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{subtitle}</p>
            </div>

            <div className="mt-6">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
