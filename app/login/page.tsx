import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { EnvWarning } from "@/components/env-warning";
import { SubmitButton } from "@/components/submit-button";
import { signIn } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const enabled = hasSupabaseEnv();

  return (
    <AuthCard title="Connexion" subtitle="Accède à ton espace de gestion GymFlow.">
      {!enabled ? <EnvWarning /> : null}

      {params.error ? (
        <div className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
          {params.error}
        </div>
      ) : null}

      <form action={signIn} className="space-y-4">
        <input type="hidden" name="next" value={params.next ?? "/"} />

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-white/70">Email</span>
          <input
            className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8 focus:ring-0"
            name="email"
            type="email"
            placeholder="gerant@gymflow.sn"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-white/70">Mot de passe</span>
          <input
            className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8 focus:ring-0"
            name="password"
            type="password"
            minLength={6}
            required
          />
        </label>

        <SubmitButton
          className="mt-2 h-11 w-full rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
          disabled={!enabled}
          pendingLabel="Connexion..."
        >
          Se connecter
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-white/35">
        Pas encore de compte ?{" "}
        <Link className="font-semibold text-emerald-400 hover:text-emerald-300" href="/signup">
          Créer un compte
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-white/25">
        <Link className="font-semibold hover:text-white/50" href="/site">
          Voir la présentation
        </Link>
      </p>
    </AuthCard>
  );
}
