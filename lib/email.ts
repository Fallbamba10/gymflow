import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "GymFlow <onboarding@resend.dev>";

export async function sendWelcomeEmail({
  to,
  gymName,
  trialEndsAt,
}: {
  to: string;
  gymName: string;
  trialEndsAt: string;
}) {
  if (!resend) return;

  const trialDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(trialEndsAt),
  );

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Bienvenue sur GymFlow — ${gymName} est prêt !`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e5e0;overflow:hidden;max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">GymFlow</p>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">Gestion de salle intelligente</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#0a0a0a;">Bienvenue, ${gymName} 🎉</p>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#555;">
              Ton espace GymFlow est configuré et prêt à l'emploi. Gère tes membres, encaisse tes abonnements et suis tes pointages depuis un seul endroit.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:28px 0;background:#f5f5f0;border-radius:8px;padding:20px;width:100%;box-sizing:border-box;">
              <tr>
                <td>
                  <p style="margin:0;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.06em;">Essai gratuit</p>
                  <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#0a0a0a;">14 jours — jusqu'au ${trialDate}</p>
                  <p style="margin:6px 0 0;font-size:13px;color:#777;">Aucune carte requise pour l'instant. Souscris avant la fin pour continuer.</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0a0a0a;">Ce que tu peux faire dès maintenant :</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;">
              ${[
                "Ajouter tes membres et leurs abonnements",
                "Enregistrer tes paiements et imprimer des reçus",
                "Scanner les QR codes à l'entrée",
                "Importer ta liste de membres en CSV",
                "Consulter ton rapport mensuel",
              ].map(item => `
              <tr>
                <td style="padding:5px 0;">
                  <span style="color:#10b981;font-size:15px;margin-right:8px;">✓</span>
                  <span style="font-size:14px;color:#444;">${item}</span>
                </td>
              </tr>`).join("")}
            </table>

            <table cellpadding="0" cellspacing="0" style="margin-top:28px;width:100%;">
              <tr>
                <td>
                  <a href="https://gymflow-ten-tan.vercel.app" style="display:inline-block;background:#10b981;color:#ffffff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">
                    Accéder au tableau de bord →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e5e5e0;">
            <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
              Des questions ? Réponds à cet email ou écris-nous à <a href="mailto:support@gymflow.app" style="color:#10b981;">support@gymflow.app</a><br/>
              GymFlow — Gestion de salle intelligente
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendTrialEndingEmail({
  to,
  gymName,
  daysLeft,
}: {
  to: string;
  gymName: string;
  daysLeft: number;
}) {
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Ton essai GymFlow se termine dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e5e0;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="background:#0a0a0a;padding:28px 32px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">GymFlow</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#0a0a0a;">
            Ton essai se termine dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}
          </p>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#555;">
            Salut ${gymName}, ton accès GymFlow expire bientôt. Souscris maintenant pour continuer à gérer ta salle sans interruption.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr><td>
              <a href="https://gymflow-ten-tan.vercel.app/billing" style="display:inline-block;background:#10b981;color:#ffffff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">
                Souscrire — 5 900 FCFA/mois →
              </a>
            </td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:13px;color:#aaa;">
            Questions ? <a href="mailto:support@gymflow.app" style="color:#10b981;">support@gymflow.app</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
