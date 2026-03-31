import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DocumentTitleSync } from "@/components/document-title-sync";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const siteUrl = new URL("https://jobsyte.co");
const defaultTitle =
  "JobSyte | Construction Project Management Software for Contractors";
const defaultDescription =
  "JobSyte helps contractors manage projects, schedule jobs, track invoices, and keep field and office teams aligned in one workflow.";

// Keep the root metadata focused on the public marketing site.
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: defaultTitle,
    template: "%s | JobSyte",
  },
  applicationName: "JobSyte",
  keywords: [
    "construction project management",
    "construction project management software",
    "contractor project management software",
    "builder job tracking",
    "construction scheduling software",
    "contractor invoice management",
    "contractor invoicing software",
    "construction workflow automation",
    "builder job site management",
    "home builder software",
    "builder change order tracking",
    "residential construction software",
  ],
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "JobSyte",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/banner_light_trans.png",
        alt: "JobSyte construction project management software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/banner_light_trans.png"],
  },
  icons: {
    icon: [
      {
        url: "/image.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/image.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/jobsyte-_safari.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning={true}
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DocumentTitleSync />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
