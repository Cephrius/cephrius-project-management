import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import MarketingShell from "@/components/landing/marketing-shell";
import { HowItWorksSection } from "@/components/landing/sections/how-it-works";
import { CtaBanner } from "@/components/landing/sections/cta-banner";
import { SITE_URL } from "@/components/landing/marketing-data";

const PAGE_TITLE = "How It Works";
const PAGE_DESCRIPTION =
  "See how JobSyte runs your week — scheduling crews, completing jobs in the field, and billing it out from the same workspace.";
const PAGE_PATH = "/how-it-works";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "how construction project management software works",
    "subcontractor workflow software",
    "field crew scheduling workflow",
    "construction invoicing workflow",
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
    "@type": "HowTo",
    name: "How JobSyte runs a sub-contractor week",
    description: PAGE_DESCRIPTION,
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Plan the week",
        text: "Open the 12-month calendar to see what's due, assign crews, and flag overdue jobs before they slip.",
        url: `${SITE_URL}${PAGE_PATH}#plan-the-week`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Run the day",
        text: "Field crews see today's stops, mark jobs complete, and the dashboard updates the office in real time.",
        url: `${SITE_URL}${PAGE_PATH}#run-the-day`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Bill it out",
        text: "Convert completed jobs into invoices, track issued vs. paid, and reconcile against the project ledger.",
        url: `${SITE_URL}${PAGE_PATH}#bill-it-out`,
      },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {SCHEMAS.map((schema, index) => (
        <script
          key={`how-it-works-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <MarketingShell>
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <CalendarClock className="size-4" />
            How it works
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            From morning huddle to end-of-month billing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            JobSyte mirrors how sub-contractors actually work — schedule the
            week, dispatch crews, capture the work, and bill it out without
            re-keying anything.
          </p>
        </header>
        <HowItWorksSection />
        <CtaBanner />
      </MarketingShell>
    </>
  );
}
