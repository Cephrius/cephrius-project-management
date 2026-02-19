import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block" aria-label="JobSyte Home">
              <Image
                src="/jobsyte_banner_light.png"
                alt="JobSyte"
                width={120}
                height={32}
                className="h-7 w-auto dark:hidden"
              />
              <Image
                src="/jobsyte_banner_dark.png"
                alt="JobSyte"
                width={120}
                height={32}
                className="hidden h-7 w-auto dark:block"
              />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Project management built for contractors. Track, schedule, invoice, and grow.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-foreground">{section}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border/50 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            {`\u00A9 ${new Date().getFullYear()} JobSyte. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
