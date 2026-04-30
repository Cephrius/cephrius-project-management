import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const siteUrl = new URL("https://employee.jobsyte.co");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "JobSyte Employees",
    template: "%s | JobSyte Employees",
  },
  applicationName: "JobSyte Employees",
  description: "View and manage your assigned jobs.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
