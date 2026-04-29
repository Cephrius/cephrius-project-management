import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import MarketingShell from "@/components/landing/marketing-shell";
import { FeaturesSection } from "@/components/landing/sections/features";
import { CtaBanner } from "@/components/landing/sections/cta-banner";
import { SITE_URL } from "@/components/landing/marketing-data";

const PAGE_TITLE = "Features";
const PAGE_DESCRIPTION =
  "Project management, scheduling, invoicing, payroll, accounting, and global search — every JobSyte feature built for sub-contractors working with national home builders.";
const PAGE_PATH = "/features";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "construction project management features",
    "subcontractor project management software features",
    "construction scheduling software",
    "contractor invoicing features",
    "field crew dashboard",
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

export default function FeaturesPage() {
  return (
    <>
      {SCHEMAS.map((schema, index) => (
        <script
          key={`features-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <MarketingShell>
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Features
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Features that match how sub-contractors actually work
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Six core surfaces, one shared source of truth — built alongside
            crews in the field, not assumed from a spreadsheet.
          </p>
        </header>
        <FeaturesSection />
        <CtaBanner />
      </MarketingShell>
    </>
  );
}
