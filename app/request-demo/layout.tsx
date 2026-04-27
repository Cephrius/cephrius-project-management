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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/request-demo",
    siteName: "JobSyte",
    title: requestDemoTitle,
    description: requestDemoDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Request a JobSyte demo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: requestDemoTitle,
    description: requestDemoDescription,
    images: ["/opengraph-image"],
  },
};

export default function RequestDemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}