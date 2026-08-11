import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, REWARD_GUIDES, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const core: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? SITE.url : `${SITE.url}${path}`,
    lastModified,
    changeFrequency: path === "/" || path === "/earn" || path === "/rewards" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/earn" || path === "/rewards" ? 0.9 : 0.7,
  }));

  const guides: MetadataRoute.Sitemap = REWARD_GUIDES.map((g) => ({
    url: `${SITE.url}/rewards/${g.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...core, ...guides];
}
