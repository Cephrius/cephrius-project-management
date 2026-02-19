import { LandingNav } from "@/components/landing/landing-nav"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingStats } from "@/components/landing/landing-stats"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingTestimonials } from "@/components/landing/landing-testimonials"
import { LandingCTA } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
