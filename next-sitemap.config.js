const PRIVATE_ROUTE_PATTERNS = [
    "/dashboard",
    "/projects",
    "/projects/*",
    "/invoices",
    "/invoices/*",
    "/search",
    "/settings",
    "/login",
    "/signup",
    "/verify",
    "/auth/*",
    "/api/*",
];

module.exports = {
    siteUrl: "https://jobsyte.co",
    generateRobotsTxt: true,
    // Mirror the noindex route groups so private URLs never land in the public sitemap.
    exclude: PRIVATE_ROUTE_PATTERNS,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                disallow: PRIVATE_ROUTE_PATTERNS,
            },
        ],
    },
};