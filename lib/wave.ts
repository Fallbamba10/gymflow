// Wave Business API — West Africa (Senegal/CI)
// Silently no-op si WAVE_API_KEY non configuré.
// Docs: https://docs.wave.com/business-api/checkout

import { createHmac } from "crypto";

export type WaveCheckoutSession = {
  id: string;
  wave_launch_url: string;
  checkout_status: "pending" | "processing" | "complete" | "error";
  client_reference: string;
  amount: string;
  currency: string;
};

export type WaveWebhookEvent = {
  id: string;
  type: "checkout.session.completed" | "checkout.session.failed";
  data: WaveCheckoutSession;
};

function getApiKey() {
  return process.env.WAVE_API_KEY ?? null;
}

export function isWaveConfigured(): boolean {
  return Boolean(getApiKey());
}

export async function createWaveCheckout(opts: {
  amount: number;
  currency?: string;
  clientReference: string;
  successUrl: string;
  errorUrl: string;
  restrictedCodes?: string[];
}): Promise<WaveCheckoutSession | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.wave.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(opts.amount),
        currency: opts.currency ?? "XOF",
        client_reference: opts.clientReference,
        success_url: opts.successUrl,
        error_url: opts.errorUrl,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Wave] checkout error:", JSON.stringify(err));
      return null;
    }

    return (await res.json()) as WaveCheckoutSession;
  } catch (err) {
    console.error("[Wave] network error:", err);
    return null;
  }
}

export async function getWaveSession(sessionId: string): Promise<WaveCheckoutSession | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://api.wave.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as WaveCheckoutSession;
  } catch {
    return null;
  }
}

// Vérifie la signature HMAC-SHA256 du webhook Wave
export function verifyWaveWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.WAVE_WEBHOOK_SECRET;
  if (!secret) return true; // pas de secret configuré → accepter (dev mode)

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return signature === expected;
}
