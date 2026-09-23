import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stayioinformations.com"),
  title: "Stayio — Nuovi clienti per il tuo ristorante, proprio quando sono pronti a scegliere",
  description:
    "Stayio collega B&B, ristoranti e attività locali: più clienti per te, un servizio in più per chi ospita.",
  openGraph: {
    title: "Stayio — Nuovi clienti per il tuo ristorante, proprio quando sono pronti a scegliere",
    description:
      "Stayio collega B&B, ristoranti e attività locali: più clienti per te, un servizio in più per chi ospita.",
    images: ["/og-image.png"],
    url: "https://stayioinformations.com",
    siteName: "Stayio",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stayio — Nuovi clienti per il tuo ristorante, proprio quando sono pronti a scegliere",
    description:
      "Stayio collega B&B, ristoranti e attività locali: più clienti per te, un servizio in più per chi ospita.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="landing">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
