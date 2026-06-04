import { Dumbbell } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10 text-ink">
      <section className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-ink text-white">
            <Dumbbell size={20} />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">GymFlow</p>
            <p className="mt-1 text-sm text-neutral-500">Gestion de salle</p>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
        </div>

        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}

