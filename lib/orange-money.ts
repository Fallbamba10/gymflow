// Orange Money Business API — Senegal / Côte d'Ivoire
// Silently no-op si ORANGE_API_KEY non configuré.
// Docs: https://developer.orange.com/apis/om-webpay-sn/

export type OrangeMoneyToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type OrangeMoneyPayRequest = {
  payToken: string;
  paymentUrl: string;
  inittxnstatus: "Success" | "Failed";
  inittxnmessage: string;
};

export type OrangeMoneyNotif = {
  status: "SUCCESS" | "FAILED" | "PENDING" | "EXPIRED";
  payToken: string;
  txnid: string;
  txnmode: string;
  inittxnmessage: string;
  inittxnstatus: string;
  subscriberMsisdn: string;
  amount: string;
  orderId: string;
};

function getCreds() {
  const clientId = process.env.ORANGE_MONEY_CLIENT_ID;
  const clientSecret = process.env.ORANGE_MONEY_CLIENT_SECRET;
  const merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY;
  const country = process.env.ORANGE_MONEY_COUNTRY ?? "sn"; // sn | ci
  if (!clientId || !clientSecret || !merchantKey) return null;
  return { clientId, clientSecret, merchantKey, country };
}

export function isOrangeMoneyConfigured(): boolean {
  return Boolean(getCreds());
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://api.orange.com/oauth/v3/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OrangeMoneyToken;
    return data.access_token;
  } catch {
    return null;
  }
}

export async function createOrangeMoneyPayment(opts: {
  amount: number;
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
  notifUrl: string;
}): Promise<OrangeMoneyPayRequest | null> {
  const creds = getCreds();
  if (!creds) return null;

  const token = await getAccessToken(creds.clientId, creds.clientSecret);
  if (!token) return null;

  const baseUrl = `https://api.orange.com/orange-money-webpay/${creds.country}/v1`;

  try {
    const res = await fetch(`${baseUrl}/webpayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        merchant_key: creds.merchantKey,
        currency: "XOF",
        order_id: opts.orderId,
        amount: opts.amount,
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
        notif_url: opts.notifUrl,
        lang: "fr",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[OrangeMoney] payment init error:", JSON.stringify(err));
      return null;
    }

    return (await res.json()) as OrangeMoneyPayRequest;
  } catch (err) {
    console.error("[OrangeMoney] network error:", err);
    return null;
  }
}
