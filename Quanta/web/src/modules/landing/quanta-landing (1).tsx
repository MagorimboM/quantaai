import {Categories} from "@/modules/landing/components/Categories"
import {CTASection} from "@/modules/landing/components/CTASection"
import {Footer} from "@/modules/landing/components/Footer"
import {Hero} from "@/modules/landing/components/Hero"
import {HowItWorks} from "@/modules/landing/components/HowItWorks"
import {Nav} from "@/modules/landing/components/Nav"
import {PrivacySection} from "@/modules/landing/components/PrivacySection"
import {ProblemSection} from "@/modules/landing/components/ProblemSection"
import {SiteConditions} from "@/modules/landing/components/SiteConditions"

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ background: '#09090B', color: '#FAFAFA' }}>
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
