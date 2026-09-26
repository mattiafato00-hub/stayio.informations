import type { ReactNode } from "react";

import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Nuovi clienti per il tuo ristorante | Stayio",
  description:
    "I turisti alloggiati nei B&B e negli hotel partner trovano il tuo ristorante nella guida digitale Stayio, proprio mentre decidono dove mangiare.",
  path: "/restaurant",
});

export default function RestaurantLayout({ children }: { children: ReactNode }) {
  return children;
}
