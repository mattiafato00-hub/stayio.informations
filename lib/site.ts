import type { Metadata } from "next";

// Dominio pubblico del sito business. NEXT_PUBLIC_SITE_URL su Vercel lo
// rende configurabile (es. per le preview); senza, vale il dominio di
// produzione. Usato per metadataBase, Open Graph, robots e sitemap.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.stayio.info").replace(/\/+$/, "");

export const SITE_NAME = "Stayio";

/**
 * Metadata completi di una pagina. openGraph e twitter vanno sempre
 * ripetuti per intero: Next.js unisce i metadata dei segmenti in modo
 * superficiale, quindi un openGraph definito in una pagina sostituisce
 * del tutto quello del layout.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      images: ["/og-image.png"],
      locale: "it_IT",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}
