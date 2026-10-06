import {Categories} from "@/modules/landing/components/Categories"
import {CTASection} from "@/modules/landing/components/CTASection"
import {Footer} from "@/modules/landing/components/Footer"
import {Hero} from "@/modules/landing/components/Hero"
import {HowItWorks} from "@/modules/landing/components/HowItWorks"
import {Nav} from "@/modules/landing/components/Nav"
import {PrivacySection} from "@/modules/landing/components/PrivacySection"
import {ProblemSection} from "@/modules/landing/components/ProblemSection"
import {SiteConditions} from "@/modules/landing/components/SiteConditions"

// The public page a visitor sees before signing in. The sections follow the
// sales story, top to bottom:
//   promise (Hero) -> pain (Problem) -> how it works -> the feature that
//   sets it apart (Site conditions) -> organisation (Categories) ->
//   trust (Privacy) -> ask (CTA).
// Both calls to action (Hero, CTA) and the nav lead to /register; returning
// users use LOG IN in the nav or footer.
export function LandingPage() {
  return (
    <div style={{ background: '#FFF8F0', color: '#2B1B0E' }}>
      <Nav />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <SiteConditions />
      <Categories />
      <PrivacySection />
      <CTASection />
      <Footer />
    </div>
  )
}