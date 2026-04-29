import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import MarketingShell from "@/components/landing/marketing-shell";
import { ModulesSection } from "@/components/landing/sections/modules";
import { CtaBanner } from "@/components/landing/sections/cta-banner";
import { MODULES, SITE_URL } from "@/components/landing/marketing-data";

const PAGE_TITLE = "Modules";
const PAGE_DESCRIPTION =
  "Projects, jobs, employees & crews, payroll, invoices, accounting, global search, and settings — every JobSyte module sharing one ledger.";
const PAGE_PATH = "/modules";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "construction project management modules",
    "contractor software modules",
    "payroll for subcontractors",
    "construction accounting software",
    "construction invoicing module",
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
    "@type": "ItemList",
    name: "JobSyte modules",
    itemListElement: MODULES.map((module, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: module.title,
      description: module.body,
    })),
  },
];

export default function ModulesPage() {
  return (
    <>
      {SCHEMAS.map((schema, index) => (
        <script
          key={`modules-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <MarketingShell>
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <LayoutDashboard className="size-4" />
            Modules
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Every module, wired together
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Projects feed jobs, jobs feed invoices, invoices feed accounting —
            and a single search bar covers all of it.
          </p>
        </header>
        <ModulesSection />
        <CtaBanner />
      </MarketingShell>
    </>
  );
}
