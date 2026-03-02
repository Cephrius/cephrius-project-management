import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DocumentTitleSync } from "@/components/document-title-sync";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "JobSyte - Contractor Operations, Simplified",
  description:
    "Manage projects, schedule jobs, and send invoices from one place. The all-in-one platform built for contractors.",
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
