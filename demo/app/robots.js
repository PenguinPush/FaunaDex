import { site } from "../lib/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/healthz"] },
    sitemap: new URL("sitemap.xml", site.url).href,
  };
}
