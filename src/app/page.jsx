import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import HowItWorks from '@/components/home/HowItWorks'
import FeaturedExperts from '@/components/home/FeaturedExperts'
import FeaturesSection from '@/components/home/FeaturesSection'
import PricingSection from '@/components/home/PricingSection'
import CtaSection from '@/components/home/CtaSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturedExperts />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
