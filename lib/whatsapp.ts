// WhatsApp Cloud API — Option B: numéro centralisé GymFlow
// Silently no-op si WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID non configurés.
// Templates à soumettre à Meta Business Manager avant utilisation.

type BodyParameter =
  | { type: "text"; text: string }
  | { type: "currency"; currency: { fallback_value: string; code: string; amount_1000: number } };

type TemplateComponent = {
  type: "body";
  parameters: BodyParameter[];
};

type SendTemplateOptions = {
  to: string;
  templateName: string;
  components?: TemplateComponent[];
};

function formatPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  const digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  if (!/^\d{7,15}$/.test(digits)) return null;
  return digits;
}

async function sendTemplate(opts: SendTemplateOptions): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) return;

  const phone = formatPhone(opts.to);
  if (!phone) return;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: opts.templateName,
            language: { code: "fr" },
            components: opts.components ?? [],
          },
        }),
      },
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("[WhatsApp] échec envoi:", JSON.stringify(err));
    }
  } catch (err) {
    console.error("[WhatsApp] erreur réseau:", err);
  }
}

// Template: gymflow_welcome
// Corps : "Bonjour {{1}} ! Bienvenue chez {{2}}. Votre inscription a bien été enregistrée."
export async function notifyWelcome(opts: {
  phone: string;
  memberName: string;
  gymName: string;
}): Promise<void> {
  if (!opts.phone) return;
  await sendTemplate({
    to: opts.phone,
    templateName: "gymflow_welcome",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: opts.memberName },
          { type: "text", text: opts.gymName },
        ],
      },
    ],
  });
}

// Template: gymflow_subscription_confirmed
// Corps : "Bonjour {{1}}, votre abonnement {{3}} chez {{2}} est confirmé. Valide jusqu'au {{4}}."
export async function notifySubscriptionConfirmed(opts: {
  phone: string;
  memberName: string;
  gymName: string;
  planName: string;
  expiresAt: string;
  gymContact?: string;
}): Promise<void> {
  if (!opts.phone) return;
  await sendTemplate({
    to: opts.phone,
    templateName: "gymflow_subscription_confirmed",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: opts.memberName },
          { type: "text", text: opts.gymName },
          { type: "text", text: opts.planName },
          { type: "text", text: opts.expiresAt },
        ],
      },
    ],
  });
}

// Template: gymflow_sessions_low
// Corps : "Bonjour {{1}}, il vous reste {{2}} séance(s) chez {{3}}. Contactez-nous pour renouveler : {{4}}"
export async function notifySessionsLow(opts: {
  phone: string;
  memberName: string;
  gymName: string;
  sessionsLeft: number;
  gymContact: string;
}): Promise<void> {
  if (!opts.phone) return;
  await sendTemplate({
    to: opts.phone,
    templateName: "gymflow_sessions_low",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: opts.memberName },
          { type: "text", text: String(opts.sessionsLeft) },
          { type: "text", text: opts.gymName },
          { type: "text", text: opts.gymContact },
        ],
      },
    ],
  });
}

// Template: gymflow_expiry_reminder
// Corps : "Bonjour {{1}}, votre abonnement chez {{2}} expire dans {{3}} jour(s). Contactez-nous : {{4}}"
export async function notifyExpiryReminder(opts: {
  phone: string;
  memberName: string;
  gymName: string;
  daysLeft: number;
  gymContact: string;
}): Promise<void> {
  if (!opts.phone) return;
  await sendTemplate({
    to: opts.phone,
    templateName: "gymflow_expiry_reminder",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: opts.memberName },
          { type: "text", text: opts.gymName },
          { type: "text", text: String(opts.daysLeft) },
          { type: "text", text: opts.gymContact },
        ],
      },
    ],
  });
}
