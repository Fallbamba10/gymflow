"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("Si un compte correspond à cette adresse, tu recevras un lien de réinitialisation par e-mail.");
    } catch {
      setError("Impossible de contacter le service. Réessaie dans un instant.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {error ? <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">{error}</div> : null}
      {message ? <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{message}</div> : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Adresse e-mail</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-mint px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
          {pending ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-neutral-500">
        <Link className="font-semibold text-mint" href="/login">Retour à la connexion</Link>
      </p>
    </>
  );
}
