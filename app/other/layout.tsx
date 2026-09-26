import type { ReactNode } from "react";

import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Bar, esperienze, eventi e investitori | Stayio",
  description:
    "Hai un'attività locale o sei interessato a Stayio in altro modo? Raccontaci di più e valutiamo insieme come procedere.",
  path: "/other",
});

export default function OtherLayout({ children }: { children: ReactNode }) {
  return children;
}
