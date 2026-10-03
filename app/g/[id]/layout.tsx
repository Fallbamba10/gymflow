import type { Metadata } from "next";
import { getPublicGymPage } from "@/lib/supabase/queries";

type GymLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const page = await getPublicGymPage(id);

  if (!page) {
    return {
      title: "Salle introuvable · DooleFit",
    };
  }

  const { gym, plans } = page;
  const title = `${gym.name} · DooleFit`;
  const description =
    gym.public_description ||
    `Découvrez ${gym.name}${gym.address ? ` à ${gym.address}` : ""}. ${plans.length} formule${plans.length > 1 ? "s" : ""} disponible${plans.length > 1 ? "s" : ""}. Contactez-nous pour vous inscrire.`;

  const coverImage =
    gym.cover_image_url ||
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gymflow-ten-tan.vercel.app";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/g/${id}`,
      siteName: "DooleFit",
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: gym.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
    alternates: {
      canonical: `${siteUrl}/g/${id}`,
    },
  };
}

export default function GymPublicLayout({ children }: GymLayoutProps) {
  return <>{children}</>;
}
