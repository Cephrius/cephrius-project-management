import type { MetadataRoute } from "next";

const SITE_URL = "https://jobsyte.co";

const DISALLOW = [
  "/dashboard",
  "/projects",
  "/projects/",
  "/invoices",
  "/invoices/",
  "/employees",
  "/employees-crews",
  "/payroll",
  "/accounting",
  "/accounting/",
  "/search",
  "/settings",
  "/login",
  "/signup",
  "/verify",
  "/auth/",
  "/api/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: DISALLOW }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
