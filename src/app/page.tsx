import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import WhyJoin from "@/components/landing/WhyJoin";
import Stats from "@/components/landing/Stats";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTABand from "@/components/landing/CTABand";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="landing-theme min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <WhyJoin />
        <Stats />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}
