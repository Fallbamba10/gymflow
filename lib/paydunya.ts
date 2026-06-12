// PayDunya — agrégateur de paiement Afrique de l'Ouest
// Supporte Wave, Orange Money, Free Money, carte Visa/Mastercard
// Docs : https://developers.paydunya.com
// Silently no-op si PAYDUNYA_MASTER_KEY non configuré.

export type PayDunyaInvoiceItem = {
  name: string;
  quantity: number;
  unit_price: string; // XOF en string, ex: "5900"
  total_price: string;
  description?: string;
};

export type PayDunyaInvoice = {
  token: string;
  invoice_url: string; // URL de paiement à ouvrir
  status: "pending" | "completed" | "cancelled" | "failed";
  total_amount: number;
  receipt_url?: string;
};

export type PayDunyaWebhookPayload = {
  status: "completed" | "cancelled" | "failed";
  response_code: string; // "00" = success
  token: string;
  invoice: {
    token: string;
    total_amount: number;
    description: string;
  };
  custom_data?: Record<string, string>;
};

function getCreds() {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const publicKey = process.env.PAYDUNYA_PUBLIC_KEY;
  const token = process.env.PAYDUNYA_TOKEN;
  if (!masterKey || !privateKey || !publicKey || !token) return null;
  return { masterKey, privateKey, publicKey, token };
}

export function isPayDunyaConfigured(): boolean {
  return Boolean(getCreds());
}

function getBaseUrl() {
  // Sandbox : https://app.paydunya.com/sandbox-api/v1
  // Production : https://app.paydunya.com/api/v1
  const mode = process.env.PAYDUNYA_MODE ?? "sandbox";
  return mode === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";
}

export async function createPayDunyaInvoice(opts: {
  amount: number;
  description: string;
  clientReference: string; // stocké dans custom_data.request_id
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
  storeName?: string;
  items?: PayDunyaInvoiceItem[];
}): Promise<PayDunyaInvoice | null> {
  const creds = getCreds();
  if (!creds) return null;

  const items = opts.items ?? [
    {
      name: opts.description,
      quantity: 1,
      unit_price: String(opts.amount),
      total_price: String(opts.amount),
    },
  ];

  const body = {
    invoice: {
      items,
      taxes: [],
      total_amount: opts.amount,
      description: opts.description,
    },
    store: {
      name: opts.storeName ?? "GymFlow",
    },
    actions: {
      cancel_url: opts.cancelUrl,
      return_url: opts.returnUrl,
      callback_url: opts.callbackUrl,
    },
    custom_data: {
      request_id: opts.clientReference,
    },
  };

  try {
    const res = await fetch(`${getBaseUrl()}/checkout-invoice/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        PAYDUNYA_MASTER_KEY: creds.masterKey,
        PAYDUNYA_PRIVATE_KEY: creds.privateKey,
        PAYDUNYA_PUBLIC_KEY: creds.publicKey,
        PAYDUNYA_TOKEN: creds.token,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[PayDunya] invoice create error:", JSON.stringify(err));
      return null;
    }

    const data = await res.json() as {
      response_code: string;
      token: string;
      description?: string;
    };

    if (data.response_code !== "00") {
      console.error("[PayDunya] invoice create failed:", data.description);
      return null;
    }

    const invoiceUrl = `${getBaseUrl().replace("/api/v1", "").replace("/sandbox-api/v1", "")}/checkout-invoice/confirm/${data.token}`;

    return {
      token: data.token,
      invoice_url: invoiceUrl,
      status: "pending",
      total_amount: opts.amount,
    };
  } catch (err) {
    console.error("[PayDunya] network error:", err);
    return null;
  }
}

export async function getPayDunyaInvoice(token: string): Promise<PayDunyaInvoice | null> {
  const creds = getCreds();
  if (!creds) return null;

  try {
    const res = await fetch(`${getBaseUrl()}/checkout-invoice/confirm/${token}`, {
      headers: {
        PAYDUNYA_MASTER_KEY: creds.masterKey,
        PAYDUNYA_PRIVATE_KEY: creds.privateKey,
        PAYDUNYA_PUBLIC_KEY: creds.publicKey,
        PAYDUNYA_TOKEN: creds.token,
      },
    });

    if (!res.ok) return null;

    const data = await res.json() as {
      response_code: string;
      status: string;
      token: string;
      invoice?: { total_amount: number };
      receipt_url?: string;
    };

    return {
      token: data.token,
      invoice_url: "",
      status: data.status === "completed" ? "completed"
        : data.status === "cancelled" ? "cancelled"
        : data.status === "failed" ? "failed"
        : "pending",
      total_amount: data.invoice?.total_amount ?? 0,
      receipt_url: data.receipt_url,
    };
  } catch {
    return null;
  }
}
