const PRIVATE_ROUTE_PATTERNS = [
    "/dashboard",
    "/projects",
    "/projects/*",
    "/invoices",
    "/invoices/*",
    "/employees",
    "/employees-crews",
    "/payroll",
    "/accounting",
    "/accounting/*",
    "/search",
    "/settings",
    "/login",
    "/signup",
    "/verify",
    "/auth/*",
    "/api/*",
];

/** Per-route SEO weighting for the public marketing surface. */
const PUBLIC_ROUTE_OVERRIDES = {
    "/": { changefreq: "weekly", priority: 1.0 },
    "/request-demo": { changefreq: "monthly", priority: 0.9 },
};

module.exports = {
    siteUrl: "https://jobsyte.co",
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    autoLastmod: true,
    changefreq: "monthly",
    priority: 0.7,
    sitemapSize: 5000,
    // Mirror the noindex route groups so private URLs never land in the public sitemap.
    exclude: PRIVATE_ROUTE_PATTERNS,
    transform: async (config, path) => {
        const override = PUBLIC_ROUTE_OVERRIDES[path];
        return {
            loc: path,
            changefreq: override?.changefreq ?? config.changefreq,
            priority: override?.priority ?? config.priority,
            lastmod: new Date().toISOString(),
        };
    },
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                disallow: PRIVATE_ROUTE_PATTERNS,
            },
        ],
        additionalSitemaps: [
            "https://jobsyte.co/sitemap.xml",
        ],
    },
};