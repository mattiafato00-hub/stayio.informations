import type { ReactNode } from "react";

import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Concierge digitale gratuito per B&B e case vacanza | Stayio",
  description:
    "Wi-Fi, check-in, regole della casa e consigli sul quartiere in una pagina che i tuoi ospiti consultano da soli, 24/7. Gratuito per chi ospita.",
  path: "/host",
});

export default function HostLayout({ children }: { children: ReactNode }) {
  return children;
}
