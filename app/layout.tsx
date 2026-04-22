import type { Metadata, Viewport } from "next";
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
  authors: [{ name: "JobSyte", url: siteUrl.toString() }],
  creator: "JobSyte",
  publisher: "Cephrius Technologies",
  category: "Construction Project Management Software",
  keywords: [
    "construction project management",
    "construction project management software",
    "contractor project management software",
    "subcontractor software",
    "subcontractor project management",
    "builder job tracking",
    "construction scheduling software",
    "contractor invoice management",
    "contractor invoicing software",
    "construction workflow automation",
    "builder job site management",
    "home builder software",
    "builder change order tracking",
    "residential construction software",
    "field crew management software",
  ],
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "JobSyte",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "JobSyte — Construction project management software for contractors",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/opengraph-image"],
    creator: "@jobsyte",
  },
  icons: {
    icon: [
      { url: "/image.png", sizes: "any" },
    ],
    apple: "/jobsyte_safari.png",
    shortcut: "/jobstye_copy.ico",
  },
  // verification: { google: "<add-search-console-token>" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
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
