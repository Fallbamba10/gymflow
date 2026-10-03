"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setPending(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setPending(false);
        return;
      }
      window.location.assign("/");
    } catch {
      setError("La mise à jour a échoué. Ouvre à nouveau le lien reçu par e-mail et réessaie.");
      setPending(false);
    }
  }

  return (
    <>
      {error ? <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">{error}</div> : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Nouveau mot de passe</span>
          <input className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Confirme le mot de passe</span>
          <input className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
        </label>
        <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-mint px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
          {pending ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
        </button>
      </form>
    </>
  );
}
