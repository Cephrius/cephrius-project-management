import type { MetadataRoute } from "next";

const SITE_URL = "https://employee.jobsyte.co";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    host: SITE_URL,
  };
}
