import type { MetadataRoute } from "next";

const SITE_URL = "https://app.jobsyte.co";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    host: SITE_URL,
  };
}
