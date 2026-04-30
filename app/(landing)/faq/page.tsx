import type { Metadata } from "next";
import { FileText } from "lucide-react";
import MarketingShell from "@/components/landing/marketing-shell";
import { FaqSection } from "@/components/landing/sections/faq";
import { CtaBanner } from "@/components/landing/sections/cta-banner";
import { FAQ_ITEMS, SITE_URL } from "@/components/landing/marketing-data";

const PAGE_TITLE = "FAQ";
const PAGE_DESCRIPTION =
  "Common questions about JobSyte — pricing, migration, security, mobile crew access, and how billing reconciles to your project ledger.";
const PAGE_PATH = "/faq";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "JobSyte FAQ",
    "construction project management software FAQ",
    "subcontractor software questions",
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
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  },
];

export default function FaqPage() {
  return (
    <>
      {SCHEMAS.map((schema, index) => (
        <script
          key={`faq-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <MarketingShell>
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <FileText className="size-4" />
            FAQ
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            The questions sub-contractors actually ask before switching
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Honest answers about migration, security, billing, and the field
            crew experience.
          </p>
        </header>
        <FaqSection />
        <CtaBanner />
      </MarketingShell>
    </>
  );
}
