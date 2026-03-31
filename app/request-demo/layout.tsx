import type { Metadata } from "next";

const requestDemoTitle = "Request a Demo | JobSyte";
const requestDemoDescription =
  "Book a JobSyte demo to see how contractors can manage projects, schedules, invoices, and team activity in one place.";

// This is the main conversion page outside the homepage, so it gets its own metadata.
export const metadata: Metadata = {
  title: "Request a Demo",
  description: requestDemoDescription,
  alternates: {
    canonical: "/request-demo",
  },
  openGraph: {
    type: "website",
    url: "/request-demo",
    siteName: "JobSyte",
    title: requestDemoTitle,
    description: requestDemoDescription,
    images: [
      {
        url: "/banner_light_trans.png",
        alt: "Request a JobSyte demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: requestDemoTitle,
    description: requestDemoDescription,
    images: ["/banner_light_trans.png"],
  },
};

export default function RequestDemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}