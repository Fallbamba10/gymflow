import type { Metadata } from "next";
import { GymFlowProvider } from "@/components/gymflow-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymFlow",
  description: "Gestion simple des salles de sport",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <GymFlowProvider>{children}</GymFlowProvider>
      </body>
    </html>
  );
}
