// Intech API — agrégateur de paiement Sénégal
// Supporte Wave, Orange Money, Free Money, Wizall
// Docs : https://docs.intech.sn/doc_intech_api.php
// Silently no-op si INTECH_API_KEY non configuré.

import { createHash } from "crypto";

export type IntechService =
  | "WAVE_SN_API_CASH_IN"
  | "ORANGE_SN_API_CASH_IN"
  | "FREE_SN_WALLET_CASH_IN"
  | "WIZALL_SN_API_CASH_IN";

export const INTECH_SERVICE_LABELS: Record<IntechService, string> = {
  WAVE_SN_API_CASH_IN: "Wave",
  ORANGE_SN_API_CASH_IN: "Orange Money",
  FREE_SN_WALLET_CASH_IN: "Free Money",
  WIZALL_SN_API_CASH_IN: "Wizall",
};

export type IntechCashInRequest = {
  phone: string;
  amount: number;
  codeService: IntechService;
  externalTransactionId: string; // notre ID interne (request_id)
  callbackUrl: string;
};

export type IntechCashInResponse = {
  success: boolean;
  transactionId?: string;
  message?: string;
  data?: Record<string, unknown>;
};

// Payload envoyé par Intech sur callbackUrl
export type IntechWebhookPayload = {
  status: "SUCCESS" | "FAILLED" | "PENDING" | "REFUNDED" | "PROCESSING" | "CANCELED";
  sha256Hash: string;
  msg: string;
  transaction: {
    transactionId: string;
    externalTransactionId: string;
    amount: number;
    phone: string;
    codeService: string;
  };
};

const BASE_URL = "https://api.intech.sn";

export function isIntechConfigured(): boolean {
  return Boolean(process.env.INTECH_API_KEY);
}

export function verifyIntechWebhook(payload: IntechWebhookPayload): boolean {
  const apiKey = process.env.INTECH_API_KEY;
  if (!apiKey) return false;

  const expected = createHash("sha256")
    .update(`${payload.transaction.transactionId}|${payload.transaction.externalTransactionId}|${apiKey}`)
    .digest("hex");

  return expected === payload.sha256Hash;
}

export async function intechCashIn(opts: IntechCashInRequest): Promise<IntechCashInResponse> {
  const apiKey = process.env.INTECH_API_KEY;
  if (!apiKey) return { success: false, message: "INTECH_API_KEY non configuré" };

  try {
    const res = await fetch(`${BASE_URL}/api-services/operation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        phone: opts.phone,
        amount: opts.amount,
        codeService: opts.codeService,
        externalTransactionId: opts.externalTransactionId,
        callbackUrl: opts.callbackUrl,
      }),
      signal: AbortSignal.timeout(65_000),
    });

    const data = (await res.json()) as Record<string, unknown>;
    const transaction = data.data as Record<string, unknown> | undefined;

    // Intech signals a successfully initiated payment with code 2000, even
    // though API errors can still be returned with an HTTP 2xx status.
    if (!res.ok || data.code !== 2000) {
      return {
        success: false,
        message: (data.msg as string) ?? (data.message as string) ?? `HTTP ${res.status}`,
        data,
      };
    }

    return {
      success: true,
      transactionId: transaction?.transactionId as string | undefined,
      data,
    };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Erreur réseau" };
  }
}

export async function intechSendWhatsApp(opts: {
  phone: string;
  message: string;
  attachedMedia?: string;       // base64
  attachedMediaExtension?: string;
}): Promise<{ success: boolean; message?: string }> {
  const apiKey = process.env.INTECH_API_KEY;
  if (!apiKey) return { success: false, message: "INTECH_API_KEY non configuré" };

  const body: Record<string, unknown> = {
    apiKey,
    codeService: "WHATSAPP_MESSAGING",
    phone: opts.phone,
    message: opts.message,
  };
  if (opts.attachedMedia) body.attachedMedia = opts.attachedMedia;
  if (opts.attachedMediaExtension) body.attachedMediaExtension = opts.attachedMediaExtension;

  try {
    const res = await fetch(`${BASE_URL}/api-services/operation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      return { success: false, message: (data.message as string) ?? `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Erreur réseau" };
  }
}
