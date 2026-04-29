import type { Metadata } from "next";

// Keep account flows out of search results.
export const metadata: Metadata = {
  title: "Account | JobSyte",
  description: "Secure account access for JobSyte customers.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}