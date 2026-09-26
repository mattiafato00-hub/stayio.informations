import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Solo le pagine pubbliche: /il-mio-concierge/<token> è privata (noindex).
const PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/host", priority: 0.9 },
  { path: "/restaurant", priority: 0.9 },
  { path: "/other", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
