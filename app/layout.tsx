import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: {
    default: "DooleFit",
    template: "%s · DooleFit",
  },
  description: "Gestion complète de salle de sport : membres, abonnements, pointage, caisse et reçus.",
  applicationName: "DooleFit",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DooleFit",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <PwaRegister />
        <PwaInstallBanner />
      </body>
    </html>
  );
}
