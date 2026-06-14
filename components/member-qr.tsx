"use server";

import QRCode from "qrcode";

type MemberQRProps = {
  memberId: string;
  memberNumber: number;
  memberName: string;
  gymName: string;
};

export async function MemberQR({ memberId, memberNumber, memberName, gymName }: MemberQRProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gymflow.app";
  const portalUrl = `${siteUrl}/m/${memberId}`;

  const svgString = await QRCode.toString(portalUrl, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#171717",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
    width: 200,
  });

  const memberNum = String(memberNumber).padStart(6, "0");

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Carte QR imprimable */}
      <div className="qr-card w-full max-w-xs overflow-hidden rounded-xl border border-line bg-white shadow-soft">
        {/* Header carte */}
        <div className="bg-ink px-4 py-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">GymFlow</p>
              <p className="truncate text-base font-semibold">{gymName}</p>
            </div>
            <div className="shrink-0 rounded-md border border-white/15 bg-white/10 px-2 py-1 font-mono text-xs font-bold text-white/80">
              #{memberNum}
            </div>
          </div>
        </div>

        {/* QR + infos */}
        <div className="flex items-center gap-4 p-4">
          {/* QR code SVG inline */}
          <div
            className="shrink-0 rounded-lg border border-line p-1.5"
            // biome-ignore lint: raw SVG from trusted library
            dangerouslySetInnerHTML={{ __html: svgString }}
            style={{ width: 96, height: 96 }}
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-tight">{memberName}</p>
            <p className="mt-1 font-mono text-xs text-neutral-500">#{memberNum}</p>
            <p className="mt-2 text-xs leading-4 text-neutral-400">
              Scanner pour<br />voir votre fiche
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line bg-paper px-4 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
            Carte membre · GymFlow
          </p>
        </div>
      </div>

      {/* Aide */}
      <p className="max-w-xs text-center text-xs leading-5 text-neutral-500">
        Présente cette carte à l&apos;accueil pour un pointage instantané par scan.
      </p>
    </div>
  );
}
