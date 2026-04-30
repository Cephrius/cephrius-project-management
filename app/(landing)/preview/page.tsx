import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import MarketingShell from "@/components/landing/marketing-shell";
import { DashboardPreviewSection } from "@/components/landing/sections/dashboard-preview";
import { CtaBanner } from "@/components/landing/sections/cta-banner";
import { SITE_URL } from "@/components/landing/marketing-data";

const PAGE_TITLE = "Dashboard Preview";
const PAGE_DESCRIPTION =
  "Tour the JobSyte dashboard — schedule focus, pipeline status, recent invoices, top jobs by value, and the monthly snapshot at a glance.";
const PAGE_PATH = "/preview";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "construction dashboard software",
    "contractor dashboard",
    "subcontractor dashboard preview",
    "construction project dashboard demo",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_PATH,
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: PAGE_TITLE,
        item: `${SITE_URL}${PAGE_PATH}`,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: PAGE_TITLE,
    url: `${SITE_URL}${PAGE_PATH}`,
    description: PAGE_DESCRIPTION,
    isPartOf: {
      "@type": "WebSite",
      name: "JobSyte",
      url: SITE_URL,
    },
  },
];

export default function PreviewPage() {
  return (
    <>
      {SCHEMAS.map((schema, index) => (
        <script
          key={`preview-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <MarketingShell>
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <LayoutDashboard className="size-4" />
            Dashboard preview
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Inside the JobSyte dashboard
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Today&apos;s schedule, this week&apos;s pipeline, billing, and
            overdue jobs — together on one screen.
          </p>
        </header>
        <DashboardPreviewSection />
        <CtaBanner />
      </MarketingShell>
    </>
  );
}
