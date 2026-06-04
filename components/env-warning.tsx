import { AlertTriangle } from "lucide-react";

export function EnvWarning() {
  return (
    <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        <p>
          Supabase n&apos;est pas encore configure. Ajoute `NEXT_PUBLIC_SUPABASE_URL`
          et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`.
        </p>
      </div>
    </div>
  );
}

