import type { Metadata } from "next";
import { HardHat } from "lucide-react";
import MarketingShell from "@/components/landing/marketing-shell";
import { WhyJobSyteSection } from "@/components/landing/sections/why-jobsyte";
import { CapabilitiesSection } from "@/components/landing/sections/capabilities";
import { CollaborationSection } from "@/components/landing/sections/collaboration";
import { CtaBanner } from "@/components/landing/sections/cta-banner";
import { SITE_URL } from "@/components/landing/marketing-data";

const PAGE_TITLE = "Why JobSyte";
const PAGE_DESCRIPTION =
  "Why sub-contractors choose JobSyte over generic project management tools — built around the real workflows of grading, framing, and finishing crews.";
const PAGE_PATH = "/why-jobsyte";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "best project management software for subcontractors",
    "construction PM software comparison",
    "subcontractor vs general contractor software",
    "field-first contractor software",
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

export default function WhyJobSytePage() {
  return (
    <>
      {SCHEMAS.map((schema, index) => (
        <script
          key={`why-jobsyte-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <MarketingShell>
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <HardHat className="size-4" />
            Why JobSyte
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Built for sub-contractor reality
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Stop pretending PM software made for general contractors fits your
            crew. Every screen earns its place.
          </p>
        </header>
        <WhyJobSyteSection />
        <CapabilitiesSection />
        <CollaborationSection />
        <CtaBanner />
      </MarketingShell>
    </>
  );
}
