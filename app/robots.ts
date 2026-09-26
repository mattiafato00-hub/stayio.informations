import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// /il-mio-concierge/ NON è in Disallow di proposito: i crawler devono
// poter leggere il noindex (meta + header X-Robots-Tag) di quelle pagine
// private; se fossero bloccate qui, un link esterno potrebbe comunque
// farle comparire nei risultati come URL senza contenuto.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
