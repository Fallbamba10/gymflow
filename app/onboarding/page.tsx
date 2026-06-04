import { AuthCard } from "@/components/auth-card";
import { EnvWarning } from "@/components/env-warning";
import { Button } from "@/components/ui/button";
import { createGym } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type OnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const enabled = hasSupabaseEnv();

  return (
    <AuthCard title="Configurer la salle" subtitle="Cette salle deviendra ton premier tenant GymFlow.">
      {!enabled ? <EnvWarning /> : null}
      {params.error ? (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
          {params.error}
        </div>
      ) : null}

      <form action={createGym} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Nom de la salle</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            name="name"
            placeholder="Salle Plateau"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Telephone</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            name="phone"
            placeholder="+221 77 123 45 67"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Adresse</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            name="address"
            placeholder="Dakar Plateau"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Devise</span>
          <select
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            name="currency"
            defaultValue="XOF"
          >
            <option value="XOF">F CFA</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <Button variant="accent" className="h-11 w-full" disabled={!enabled}>
          Terminer la configuration
        </Button>
      </form>
    </AuthCard>
  );
}

